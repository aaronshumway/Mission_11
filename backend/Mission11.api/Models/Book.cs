using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mission11.api.Models;

[Table("Books")]
public class Book
{
    [Key]
    [Column("BookID")]
    public int BookId { get; set; }

    [Column("Title")]
    public string Title { get; set; } = string.Empty;

    [Column("Author")]
    public string Author { get; set; } = string.Empty;

    [Column("Publisher")]
    public string Publisher { get; set; } = string.Empty;

    [Column("ISBN")]
    public string Isbn { get; set; } = string.Empty;

    [Column("Classification")]
    public string Classification { get; set; } = string.Empty;

    [Column("Category")]
    public string Category { get; set; } = string.Empty;

    [Column("PageCount")]
    public int PageCount { get; set; }

    [Column("Price")]
    public double Price { get; set; }
}
