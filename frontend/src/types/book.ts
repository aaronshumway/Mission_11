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

/** Payload for create/update (no id). */
export interface BookInput {
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

export interface CartItem {
  bookId: number
  title: string
  price: number
  quantity: number
}
