using Microsoft.EntityFrameworkCore;
using Mission11.api.Models;

namespace Mission11.api.Data;

public class BookstoreDbContext : DbContext
{
    public BookstoreDbContext(DbContextOptions<BookstoreDbContext> options)
        : base(options)
    {
    }

    public DbSet<Book> Books => Set<Book>();
}
