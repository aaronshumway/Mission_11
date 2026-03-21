using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mission11.api.Data;
using Mission11.api.Models;

namespace Mission11.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly BookstoreDbContext _context;

    public BooksController(BookstoreDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Paged books sorted by title. Query: page, pageSize (default 5), sortTitle=asc|desc.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedBooksResponse>> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string sortTitle = "asc")
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 5;
        }

        if (pageSize > 100)
        {
            pageSize = 100;
        }

        var query = _context.Books.AsQueryable();
        query = string.Equals(sortTitle, "desc", StringComparison.OrdinalIgnoreCase)
            ? query.OrderByDescending(b => b.Title)
            : query.OrderBy(b => b.Title);

        var totalCount = await query.CountAsync();
        var books = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedBooksResponse(books, totalCount, page, pageSize));
    }
}

public record PagedBooksResponse(
    IReadOnlyList<Book> Books,
    int TotalCount,
    int Page,
    int PageSize);
