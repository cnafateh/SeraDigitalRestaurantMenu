using System.Text.Json;
using Npgsql;
using NpgsqlTypes;

namespace Sera.Api;

public class MenuStore(NpgsqlDataSource dataSource, IWebHostEnvironment environment)
{
    public async Task Initialize()
    {
        var schema = await File.ReadAllTextAsync(Path.Combine(environment.ContentRootPath, "schema.sql"));
        await using var command = dataSource.CreateCommand(schema);
        await command.ExecuteNonQueryAsync();
        await using var count = dataSource.CreateCommand("SELECT count(*) FROM venues");
        if ((long)(await count.ExecuteScalarAsync() ?? 0L) != 0) return;
        var seed = JsonSerializer.Deserialize<Seed>(await File.ReadAllTextAsync(Path.Combine(environment.ContentRootPath, "seed.json")), JsonDefaults.Options)!;
        foreach (var venue in seed.Venues) await SaveVenue(venue);
        foreach (var item in seed.Items) await SaveItem(item with { Id = Guid.NewGuid() });
    }

    public async Task<Venue[]> GetVenues(bool publishedOnly = false)
    {
        await using var command = dataSource.CreateCommand("SELECT id,name,tagline,description,location,hours,currency,template,hero_image,published FROM venues WHERE (NOT @published_only OR published) ORDER BY id");
        command.Parameters.AddWithValue("published_only", publishedOnly);
        await using var reader = await command.ExecuteReaderAsync();
        var result = new List<Venue>();
        while (await reader.ReadAsync()) result.Add(ReadVenue(reader));
        return result.ToArray();
    }

    public async Task<Venue?> GetVenue(string id)
    {
        await using var command = dataSource.CreateCommand("SELECT id,name,tagline,description,location,hours,currency,template,hero_image,published FROM venues WHERE id=@id");
        command.Parameters.AddWithValue("id", id);
        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? ReadVenue(reader) : null;
    }

    public async Task SaveVenue(Venue venue)
    {
        await using var command = dataSource.CreateCommand("""
            INSERT INTO venues (id,name,tagline,description,location,hours,currency,template,hero_image,published)
            VALUES (@id,@name,@tagline,@description,@location,@hours,@currency,@template,@hero_image,@published)
            ON CONFLICT (id) DO UPDATE SET name=excluded.name,tagline=excluded.tagline,description=excluded.description,
            location=excluded.location,hours=excluded.hours,currency=excluded.currency,template=excluded.template,
            hero_image=excluded.hero_image,published=excluded.published,updated_at=now()
            """);
        command.Parameters.AddWithValue("id", venue.Id);
        command.Parameters.AddWithValue("name", venue.Name);
        command.Parameters.AddWithValue("tagline", venue.Tagline);
        command.Parameters.AddWithValue("description", venue.Description);
        command.Parameters.AddWithValue("location", venue.Location);
        command.Parameters.AddWithValue("hours", venue.Hours);
        command.Parameters.AddWithValue("currency", venue.Currency);
        command.Parameters.AddWithValue("template", venue.Template);
        command.Parameters.AddWithValue("hero_image", venue.HeroImage);
        command.Parameters.AddWithValue("published", venue.Published);
        await command.ExecuteNonQueryAsync();
    }

    public async Task<MenuItem[]> GetItems(string venueId)
    {
        await using var command = dataSource.CreateCommand("SELECT id,venue_id,slug,category,name,subtitle,description,image,ingredients,allergens,tags,variants,featured,available,sort_order FROM menu_items WHERE venue_id=@venue ORDER BY sort_order,name");
        command.Parameters.AddWithValue("venue", venueId);
        await using var reader = await command.ExecuteReaderAsync();
        var result = new List<MenuItem>();
        while (await reader.ReadAsync()) result.Add(ReadItem(reader));
        return result.ToArray();
    }

    public async Task<bool> SaveItem(MenuItem item)
    {
        await using var command = dataSource.CreateCommand("""
            INSERT INTO menu_items (id,venue_id,slug,category,name,subtitle,description,image,ingredients,allergens,tags,variants,featured,available,sort_order)
            VALUES (@id,@venue,@slug,@category,@name,@subtitle,@description,@image,@ingredients,@allergens,@tags,@variants,@featured,@available,@sort_order)
            ON CONFLICT (id) DO UPDATE SET venue_id=excluded.venue_id,slug=excluded.slug,category=excluded.category,
            name=excluded.name,subtitle=excluded.subtitle,description=excluded.description,image=excluded.image,
            ingredients=excluded.ingredients,allergens=excluded.allergens,tags=excluded.tags,variants=excluded.variants,
            featured=excluded.featured,available=excluded.available,sort_order=excluded.sort_order,updated_at=now()
            """);
        command.Parameters.AddWithValue("id", item.Id);
        command.Parameters.AddWithValue("venue", item.VenueId);
        command.Parameters.AddWithValue("slug", item.Slug);
        command.Parameters.AddWithValue("category", item.Category);
        command.Parameters.AddWithValue("name", item.Name);
        command.Parameters.AddWithValue("subtitle", item.Subtitle);
        command.Parameters.AddWithValue("description", item.Description);
        command.Parameters.AddWithValue("image", item.Image);
        AddJson(command, "ingredients", item.Ingredients);
        AddJson(command, "allergens", item.Allergens);
        AddJson(command, "tags", item.Tags);
        AddJson(command, "variants", item.Variants);
        command.Parameters.AddWithValue("featured", item.Featured);
        command.Parameters.AddWithValue("available", item.Available);
        command.Parameters.AddWithValue("sort_order", item.SortOrder);
        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteItem(Guid id)
    {
        await using var command = dataSource.CreateCommand("DELETE FROM menu_items WHERE id=@id");
        command.Parameters.AddWithValue("id", id);
        return await command.ExecuteNonQueryAsync() > 0;
    }

    static void AddJson(NpgsqlCommand command, string name, object value) =>
        command.Parameters.Add(new NpgsqlParameter(name, NpgsqlDbType.Jsonb) { Value = JsonSerializer.Serialize(value, JsonDefaults.Options) });
    static Venue ReadVenue(NpgsqlDataReader r) => new(r.GetString(0),r.GetString(1),r.GetString(2),r.GetString(3),r.GetString(4),r.GetString(5),r.GetString(6),r.GetString(7),r.GetString(8),r.GetBoolean(9));
    static MenuItem ReadItem(NpgsqlDataReader r) => new(r.GetGuid(0),r.GetString(1),r.GetString(2),r.GetString(3),r.GetString(4),r.GetString(5),r.GetString(6),r.GetString(7),
        JsonSerializer.Deserialize<string[]>(r.GetString(8), JsonDefaults.Options) ?? [],
        JsonSerializer.Deserialize<string[]>(r.GetString(9), JsonDefaults.Options) ?? [],
        JsonSerializer.Deserialize<string[]>(r.GetString(10), JsonDefaults.Options) ?? [],
        JsonSerializer.Deserialize<Variant[]>(r.GetString(11), JsonDefaults.Options) ?? [],
        r.GetBoolean(12),r.GetBoolean(13),r.GetInt32(14));
    record Seed(Venue[] Venues, MenuItem[] Items);
}
