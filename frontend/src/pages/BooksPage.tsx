import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../apiConfig'
import { CartOffcanvas } from '../components/CartOffcanvas'
import { CartSummary } from '../components/CartSummary'
import { CategoryFilter } from '../components/CategoryFilter'
import { useCart } from '../context/CartContext'
import type { Book, PagedBooksResponse } from '../types/book'

const PAGE_SIZE_OPTIONS = [5, 10, 25] as const

function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPage = Number(searchParams.get('page') ?? '1')
  const initialPageSize = Number(searchParams.get('pageSize') ?? '5')
  const initialSortTitle = searchParams.get('sortTitle') === 'desc' ? 'desc' : 'asc'
  const initialCategories = searchParams.getAll('category')

  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(initialPage > 0 ? initialPage : 1)
  const [pageSize, setPageSize] = useState(
    PAGE_SIZE_OPTIONS.includes(initialPageSize as (typeof PAGE_SIZE_OPTIONS)[number])
      ? initialPageSize
      : 5,
  )
  const [sortTitle, setSortTitle] = useState<'asc' | 'desc'>(initialSortTitle)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategories,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart, cartItems, totalItems, totalPrice } = useCart()

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    params.set('sortTitle', sortTitle)
    selectedCategories.forEach((cat) => params.append('category', cat))
    setSearchParams(params, { replace: true })
  }, [page, pageSize, sortTitle, selectedCategories, setSearchParams])

  useEffect(() => {
    fetch(`${API_BASE}/api/books/categories`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed loading categories')
        }
        return res.json() as Promise<string[]>
      })
      .then((data) => setCategories(data))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortTitle,
    })
    selectedCategories.forEach((cat) => params.append('category', cat))

    setLoading(true)
    setError(null)

    fetch(`${API_BASE}/api/books?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`)
        }
        return res.json() as Promise<PagedBooksResponse>
      })
      .then((data) => {
        setBooks(data.books)
        setTotalCount(data.totalCount)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setError(err instanceof Error ? err.message : 'Failed to load books')
        setBooks([])
        setTotalCount(0)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [page, pageSize, sortTitle, selectedCategories])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  useEffect(() => {
    if (totalCount > 0 && page > totalPages) {
      setPage(totalPages)
    }
  }, [totalCount, page, totalPages])

  const safePage = Math.min(page, totalPages)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
  const start = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalCount)

  function toggleCategory(nextCategory: string) {
    setSelectedCategories((prev) =>
      prev.includes(nextCategory)
        ? prev.filter((c) => c !== nextCategory)
        : [...prev, nextCategory],
    )
    setPage(1)
  }

  function clearCategories() {
    setSelectedCategories([])
    setPage(1)
  }

  const cartLink = useMemo(() => {
    const returnParams = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortTitle,
    })
    selectedCategories.forEach((cat) => returnParams.append('category', cat))
    return `/cart?returnTo=${encodeURIComponent(`/books?${returnParams.toString()}`)}`
  }, [page, pageSize, sortTitle, selectedCategories])

  return (
    <div className="container py-4 text-start">
      <header className="mb-4">
        <h1 className="h2 mb-0">Online Bookstore</h1>
      </header>
      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <button
            className="btn btn-outline-secondary w-100 mb-2 d-flex justify-content-between align-items-center"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#categoryFilterCollapse"
            aria-expanded="true"
            aria-controls="categoryFilterCollapse"
          >
            <span>
              Filter
              {selectedCategories.length > 0
                ? ` (${selectedCategories.length} selected)`
                : ''}
            </span>
            <span className="small" aria-hidden>
              ▼
            </span>
          </button>
          <div className="collapse show" id="categoryFilterCollapse">
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              onClearCategories={clearCategories}
            />
          </div>
        </div>
        <div className="col-12 col-md-8 col-lg-9">
          <div className="row g-3 mb-3 align-items-end">
            <div className="col-auto">
              <label htmlFor="pageSize" className="form-label mb-1">
                Results per page
              </label>
              <select
                id="pageSize"
                className="form-select form-select-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  setSortTitle((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  setPage(1)
                }}
              >
                Sort by title: {sortTitle === 'asc' ? 'A → Z' : 'Z → A'}
              </button>
            </div>
            <div className="col text-muted small">
              {totalCount > 0 ? `Showing ${start}–${end} of ${totalCount}` : !loading ? 'No books' : ''}
            </div>
            <div className="col-12 col-lg-4 ms-lg-auto">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end align-items-start">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#cartPreview"
                  aria-controls="cartPreview"
                >
                  Preview cart
                </button>
                <CartSummary
                  totalItems={totalItems}
                  totalPrice={totalPrice}
                  cartLink={cartLink}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Publisher</th>
                    <th>ISBN</th>
                    <th>Classification</th>
                    <th>Category</th>
                    <th className="text-end">Pages</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Cart</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.bookId}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.publisher}</td>
                      <td>{book.isbn}</td>
                      <td>{book.classification}</td>
                      <td>{book.category}</td>
                      <td className="text-end">{book.pageCount}</td>
                      <td className="text-end">{formatPrice(book.price)}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            addToCart({
                              bookId: book.bookId,
                              title: book.title,
                              price: book.price,
                            })
                          }
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <nav aria-label="Book pages">
              <ul className="pagination pagination-sm flex-wrap">
                <li className={`page-item ${safePage <= 1 ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                </li>
                {pageNumbers.map((n) => (
                  <li key={n} className={`page-item ${n === safePage ? 'active' : ''}`}>
                    <button type="button" className="page-link" onClick={() => setPage(n)}>
                      {n}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${safePage >= totalPages ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}

          <div className="mt-3">
            <Link className="btn btn-primary" to={cartLink}>
              Go to Cart
            </Link>
          </div>
        </div>
      </div>
      <CartOffcanvas
        cartItems={cartItems}
        totalItems={totalItems}
        totalPrice={totalPrice}
        cartLink={cartLink}
      />
    </div>
  )
}
