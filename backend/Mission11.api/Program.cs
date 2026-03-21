using Microsoft.EntityFrameworkCore;
using Mission11.api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// CORS: allow the Vite dev server origin (must match frontend dev URL in vite.config.ts).
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "ViteDev",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();
        });
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

app.UseCors("ViteDev");

app.UseAuthorization();

app.MapControllers();

app.Run();
