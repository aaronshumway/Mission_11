import { useEffect, useState } from 'react'
import { API_BASE } from './apiConfig'
import type { Book, PagedBooksResponse } from './types/book'

const PAGE_SIZE_OPTIONS = [5, 10, 25] as const

function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sortTitle, setSortTitle] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortTitle,
    })
    const url = `${API_BASE}/api/books?${params.toString()}`

    setLoading(true)
    setError(null)

    fetch(url, { signal: controller.signal })
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
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [page, pageSize, sortTitle])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  useEffect(() => {
    if (totalCount === 0) {
      return
    }
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [totalCount, pageSize, page, totalPages])

  const safePage = Math.min(page, totalPages)
  const start = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalCount)

  function handlePageSizeChange(next: number) {
    setPageSize(next)
    setPage(1)
  }

  function toggleSortTitle() {
    setSortTitle((s) => (s === 'asc' ? 'desc' : 'asc'))
    setPage(1)
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="book-list">
      <div className="row align-items-end g-3 mb-3">
        <div className="col-auto">
          <label htmlFor="pageSize" className="form-label mb-0">
            Results per page
          </label>
          <select
            id="pageSize"
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
            onClick={toggleSortTitle}
          >
            Sort by title: {sortTitle === 'asc' ? 'A → Z' : 'Z → A'}
          </button>
        </div>
        <div className="col text-muted small">
          {totalCount > 0 ? (
            <>
              Showing {start}–{end} of {totalCount}
            </>
          ) : (
            !loading && 'No books'
          )}
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
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Publisher</th>
                <th scope="col">ISBN</th>
                <th scope="col">Classification</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-end">
                  Pages
                </th>
                <th scope="col" className="text-end">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.bookId}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.publisher}</td>
                  <td>{b.isbn}</td>
                  <td>{b.classification}</td>
                  <td>{b.category}</td>
                  <td className="text-end">{b.pageCount}</td>
                  <td className="text-end">{formatPrice(b.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <nav aria-label="Book pagination">
          <ul className="pagination pagination-sm flex-wrap">
            <li className={`page-item ${safePage <= 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                Previous
              </button>
            </li>
            {pageNumbers.map((n) => (
              <li
                key={n}
                className={`page-item ${n === safePage ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${safePage >= totalPages ? 'disabled' : ''}`}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}
