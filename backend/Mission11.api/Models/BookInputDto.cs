namespace Mission11.api.Models;

/// <summary>
/// Fields for creating or updating a book (no primary key).
/// </summary>
public class BookInputDto
{
    public string Title { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public string Publisher { get; set; } = string.Empty;

    public string Isbn { get; set; } = string.Empty;

    public string Classification { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public int PageCount { get; set; }

    public double Price { get; set; }
}
