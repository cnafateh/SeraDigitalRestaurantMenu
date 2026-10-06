using System.Text.Json;
using System.Text.Json.Serialization;

namespace Sera.Api;

public record Venue(string Id, string Name, string Tagline, string Description, string Location, string Hours, string Currency, string Template, string HeroImage, bool Published);
public record Variant(string Label, decimal Price);
public record MenuItem(Guid Id, string VenueId, string Slug, string Category, string Name, string Subtitle, string Description, string Image, string[] Ingredients, string[] Allergens, string[] Tags, Variant[] Variants, bool Featured, bool Available, int SortOrder);
public record MenuResponse(Venue Venue, MenuItem[] Items);
public record LoginRequest(string Password);

public static class JsonDefaults
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        NumberHandling = JsonNumberHandling.Strict
    };
}
