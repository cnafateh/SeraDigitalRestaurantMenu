using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.RateLimiting;
using Npgsql;
using NpgsqlTypes;
using Sera.Api;

var builder = WebApplication.CreateBuilder(args);
var connection = Environment.GetEnvironmentVariable("DATABASE_URL") ?? builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("Set DATABASE_URL to a PostgreSQL connection string.");
builder.Services.AddSingleton(NpgsqlDataSource.Create(connection));
builder.Services.AddScoped<MenuStore>();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
{
    options.Cookie.Name = "sera_admin";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.Events.OnRedirectToLogin = context => { context.Response.StatusCode = 401; return Task.CompletedTask; };
    options.Events.OnRedirectToAccessDenied = context => { context.Response.StatusCode = 403; return Task.CompletedTask; };
});
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options => options.AddFixedWindowLimiter("login", limiter =>
{
    limiter.PermitLimit = 5;
    limiter.Window = TimeSpan.FromMinutes(1);
    limiter.QueueLimit = 0;
}));
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 12 * 1024 * 1024);

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// A same-origin custom header protects cookie-authenticated writes from cross-site forms.
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    if (context.Request.Path.StartsWithSegments("/api/admin") && context.Request.Method is not ("GET" or "HEAD" or "OPTIONS"))
    {
        var origin = context.Request.Headers.Origin.ToString();
        var validOrigin = origin.Length == 0 || (Uri.TryCreate(origin, UriKind.Absolute, out var originUri) &&
            originUri.Scheme is "http" or "https" &&
            string.Equals(originUri.Authority, context.Request.Host.Value, StringComparison.OrdinalIgnoreCase));
        if (context.Request.Headers["X-Sera-Request"] != "dashboard" ||
            !validOrigin)
        {
            context.Response.StatusCode = 403;
            return;
        }
    }
    await next();
});

var uploads = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploads);
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/templates", () => Results.Ok(new[] { "pizzeria", "traditional", "fastfood", "cafe", "gelato" }));
app.MapGet("/api/venues", async (MenuStore store) => Results.Ok(await store.GetVenues(true)));
app.MapGet("/api/menu/{venueId}", async (string venueId, MenuStore store) =>
{
    var venue = await store.GetVenue(venueId);
    return venue is null || !venue.Published ? Results.NotFound() : Results.Ok(new MenuResponse(venue, await store.GetItems(venueId)));
});
app.MapGet("/uploads/{file}", (string file) =>
{
    if (!Regex.IsMatch(file, "^[a-f0-9]{32}\\.(webp|png|jpg)$")) return Results.NotFound();
    var path = Path.Combine(uploads, file);
    if (!File.Exists(path)) return Results.NotFound();
    var type = file.EndsWith(".webp") ? "image/webp" : file.EndsWith(".png") ? "image/png" : "image/jpeg";
    return Results.File(path, type, enableRangeProcessing: true);
});

app.MapPost("/api/admin/login", async (LoginRequest request, HttpContext context) =>
{
    var configured = Environment.GetEnvironmentVariable("SERA_ADMIN_PASSWORD");
    if (string.IsNullOrWhiteSpace(configured) || configured.Length < 12)
        return Results.Problem("Set SERA_ADMIN_PASSWORD to at least 12 characters before using the dashboard.", statusCode: 503);
    var actual = SHA256.HashData(Encoding.UTF8.GetBytes(request.Password ?? ""));
    var expected = SHA256.HashData(Encoding.UTF8.GetBytes(configured));
    if (!CryptographicOperations.FixedTimeEquals(actual, expected)) return Results.Unauthorized();
    await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.Name, "admin")], CookieAuthenticationDefaults.AuthenticationScheme)));
    return Results.Ok(new { authenticated = true });
}).RequireRateLimiting("login");
app.MapPost("/api/admin/logout", async (HttpContext context) =>
{
    await context.SignOutAsync();
    return Results.NoContent();
}).RequireAuthorization();
app.MapGet("/api/admin/session", (ClaimsPrincipal user) => Results.Ok(new { authenticated = user.Identity?.IsAuthenticated == true })).RequireAuthorization();
app.MapGet("/api/admin/venues", async (MenuStore store) => Results.Ok(await store.GetVenues())).RequireAuthorization();
app.MapGet("/api/admin/menu/{venueId}", async (string venueId, MenuStore store) =>
{
    var venue = await store.GetVenue(venueId);
    return venue is null ? Results.NotFound() : Results.Ok(new MenuResponse(venue, await store.GetItems(venueId)));
}).RequireAuthorization();
app.MapPut("/api/admin/venues/{venueId}", async (string venueId, Venue venue, MenuStore store) =>
{
    if (venueId != venue.Id) return Results.BadRequest(new { error = "Venue ID cannot be changed." });
    if (!Validation.Venue(venue, out var error)) return Results.BadRequest(new { error });
    await store.SaveVenue(venue);
    return Results.Ok(venue);
}).RequireAuthorization();
app.MapPost("/api/admin/venues", async (Venue venue, MenuStore store) =>
{
    if (!Validation.Venue(venue, out var error)) return Results.BadRequest(new { error });
    if (await store.GetVenue(venue.Id) is not null) return Results.Conflict(new { error = "That URL is already in use." });
    await store.SaveVenue(venue);
    return Results.Created($"/api/admin/menu/{venue.Id}", venue);
}).RequireAuthorization();
app.MapPost("/api/admin/items", async (MenuItem item, MenuStore store) =>
{
    if (!Validation.Item(item, out var error)) return Results.BadRequest(new { error });
    if (await store.GetVenue(item.VenueId) is null) return Results.NotFound();
    var saved = item with { Id = Guid.NewGuid() };
    try { await store.SaveItem(saved); return Results.Created($"/api/admin/items/{saved.Id}", saved); }
    catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation) { return Results.Conflict(new { error = "This item slug already exists." }); }
}).RequireAuthorization();
app.MapPut("/api/admin/items/{id:guid}", async (Guid id, MenuItem item, MenuStore store) =>
{
    if (id != item.Id) return Results.BadRequest(new { error = "Item ID cannot be changed." });
    if (!Validation.Item(item, out var error)) return Results.BadRequest(new { error });
    try { return await store.SaveItem(item) ? Results.Ok(item) : Results.NotFound(); }
    catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation) { return Results.Conflict(new { error = "This item slug already exists." }); }
}).RequireAuthorization();
app.MapDelete("/api/admin/items/{id:guid}", async (Guid id, MenuStore store) =>
    await store.DeleteItem(id) ? Results.NoContent() : Results.NotFound()).RequireAuthorization();
app.MapPost("/api/admin/upload", async (IFormFile file) =>
{
    if (file.Length is 0 or > 10_000_000) return Results.BadRequest(new { error = "Image must be between 1 byte and 10 MB." });
    var header = new byte[12];
    await using var input = file.OpenReadStream();
    var read = await input.ReadAsync(header);
    var extension = read >= 12 && Encoding.ASCII.GetString(header, 0, 4) == "RIFF" && Encoding.ASCII.GetString(header, 8, 4) == "WEBP" ? "webp"
        : read >= 8 && header[..8].SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) ? "png"
        : read >= 3 && header[0] == 0xff && header[1] == 0xd8 && header[2] == 0xff ? "jpg" : "";
    if (extension == "") return Results.BadRequest(new { error = "Only WebP, PNG and JPEG images are supported." });
    var name = $"{Guid.NewGuid():N}.{extension}";
    await using var output = File.Create(Path.Combine(uploads, name));
    await using var fullInput = file.OpenReadStream();
    await fullInput.CopyToAsync(output);
    return Results.Ok(new { url = $"/uploads/{name}" });
}).RequireAuthorization().DisableAntiforgery();

// The published image serves the SPA from wwwroot; the API-only container has no static assets.
if (app.Environment.WebRootFileProvider.GetFileInfo("index.html").Exists)
    app.MapFallbackToFile("index.html");

await using (var scope = app.Services.CreateAsyncScope())
    await scope.ServiceProvider.GetRequiredService<MenuStore>().Initialize();
app.Run();

public partial class Program { }

static class Validation
{
    private static readonly string[] Templates = ["pizzeria", "traditional", "fastfood", "cafe", "gelato"];
    public static bool Venue(Venue venue, out string error)
    {
        error = "Venue ID must be a lowercase URL slug; name and template are required.";
        return Regex.IsMatch(venue.Id ?? "", "^[a-z0-9-]{2,50}$") &&
            venue.Name is { Length: > 0 and <= 100 } && Templates.Contains(venue.Template) &&
            venue.Tagline is { Length: <= 200 } && venue.Description is { Length: <= 2000 } &&
            venue.Location is { Length: <= 200 } && venue.Hours is { Length: <= 100 } &&
            Regex.IsMatch(venue.Currency ?? "", "^[A-Z]{3}$") && venue.HeroImage is { Length: <= 500 };
    }
    public static bool Item(MenuItem item, out string error)
    {
        error = "Invalid item. Check its URL slug, name, category and prices.";
        return Regex.IsMatch(item.Slug ?? "", "^[a-z0-9-]{2,80}$") &&
            Regex.IsMatch(item.VenueId ?? "", "^[a-z0-9-]{2,50}$") && item.Name is { Length: > 0 and <= 120 } &&
            item.Category is { Length: > 0 and <= 80 } && item.Subtitle is { Length: <= 200 } && item.Description is { Length: <= 2000 } &&
            item.Image is { Length: <= 500 } && item.Ingredients is { Length: <= 30 } && item.Allergens is { Length: <= 20 } &&
            item.Tags is { Length: <= 20 } && item.Variants is { Length: > 0 and <= 10 } &&
            item.Ingredients.All(v => v is { Length: > 0 and <= 100 }) && item.Allergens.All(v => v is { Length: > 0 and <= 100 }) &&
            item.Tags.All(v => v is { Length: > 0 and <= 100 }) &&
            item.Variants.All(v => v is not null && v.Label is { Length: > 0 and <= 50 } && v.Price >= 0 && v.Price <= 1_000_000);
    }
}
