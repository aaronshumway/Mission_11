export interface Book {
  bookId: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

export interface PagedBooksResponse {
  books: Book[]
  totalCount: number
  page: number
  pageSize: number
}
