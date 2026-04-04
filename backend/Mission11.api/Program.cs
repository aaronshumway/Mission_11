using Microsoft.EntityFrameworkCore;
using Mission11.api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// CORS: Vite dev origin is in appsettings. Add deployed frontend URL via Cors:AdditionalOrigins
// (semicolon-separated) or Azure App Service setting Cors__AdditionalOrigins.
var corsOrigins = new List<string>(
    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? []);
var additional = builder.Configuration["Cors:AdditionalOrigins"];
if (!string.IsNullOrWhiteSpace(additional))
{
    foreach (var part in additional.Split(
                 ';',
                 StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
    {
        if (!corsOrigins.Contains(part, StringComparer.OrdinalIgnoreCase))
        {
            corsOrigins.Add(part);
        }
    }
}

if (corsOrigins.Count == 0)
{
    corsOrigins.Add("http://localhost:5173");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "Frontend",
        policy => policy.WithOrigins(corsOrigins.ToArray()).AllowAnyHeader().AllowAnyMethod());
});

var dbPath = Path.Combine(builder.Environment.ContentRootPath, "Bookstore.sqlite");
builder.Services.AddDbContext<BookstoreDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
