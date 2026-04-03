import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchBooksPage, fetchCategories } from '../api/booksApi'
import { deleteBook, updateBook } from '../api/booksAdmin'
import { BookForm } from '../components/BookForm'
import { CategoryFilter } from '../components/CategoryFilter'
import type { Book, BookInput, PagedBooksResponse } from '../types/book'

const PAGE_SIZE_OPTIONS = [5, 10, 25] as const

function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

type FlashMessage = { type: 'success' | 'danger'; message: string }

// Admin home: browse with filters, edit in place, add via /adminbooks/new, delete with a modal.

export function AdminBooksPage() {
  const location = useLocation()
  const navigate = useNavigate()
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
  const [actionError, setActionError] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)
  const [flash, setFlash] = useState<FlashMessage | null>(null)

  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  // Success messages from navigation (e.g. after adding a book) land here once.
  useEffect(() => {
    const st = location.state as { flash?: FlashMessage } | null
    if (st?.flash) {
      setFlash(st.flash)
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
    }
  }, [location, navigate])

  useEffect(() => {
    if (!flash) {
      return
    }
    const timer = window.setTimeout(() => setFlash(null), 6000)
    return () => window.clearTimeout(timer)
  }, [flash])

  useEffect(() => {
    if (!deleteTarget) {
      return
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deletePending) {
        setDeleteTarget(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [deleteTarget, deletePending])

  // Keep filters and pagination in the query string so refresh and links stay consistent.
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    params.set('sortTitle', sortTitle)
    selectedCategories.forEach((cat) => params.append('category', cat))
    setSearchParams(params, { replace: true })
  }, [page, pageSize, sortTitle, selectedCategories, setSearchParams])

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  // Table data: bumps when we edit or delete so the row reflects the server.
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

    fetchBooksPage(params, controller.signal)
      .then((data: PagedBooksResponse) => {
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
  }, [page, pageSize, sortTitle, selectedCategories, refresh])

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

  async function handleFormSubmit(input: BookInput) {
    setActionError(null)
    try {
      if (editingBook) {
        await updateBook(editingBook.bookId, input)
        setEditingBook(null)
        setFlash({ type: 'success', message: 'Book updated successfully.' })
        setRefresh((r) => r + 1)
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  function handleCancelForm() {
    setEditingBook(null)
    setActionError(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }
    setActionError(null)
    setDeletePending(true)
    try {
      const title = deleteTarget.title
      await deleteBook(deleteTarget.bookId)
      setDeleteTarget(null)
      setFlash({
        type: 'success',
        message: `Deleted "${title}".`,
      })
      setRefresh((r) => r + 1)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Delete failed')
      setDeleteTarget(null)
    } finally {
      setDeletePending(false)
    }
  }

  const showEditForm = editingBook !== null

  return (
    <div className="container py-4 text-start">
      <header className="mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 className="h2 mb-0">Admin — Books</h1>
          <p className="text-muted small mb-0">Add, edit, or remove books in the database.</p>
        </div>
        <Link className="btn btn-outline-secondary btn-sm" to="/books">
          Back to storefront
        </Link>
      </header>

      {flash && (
        <div
          className={`alert ${flash.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}
          role="status"
        >
          {flash.message}
          <button
            type="button"
            className="btn-close"
            aria-label="Dismiss"
            onClick={() => setFlash(null)}
          />
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <button
            className="btn btn-outline-secondary w-100 mb-2 d-flex justify-content-between align-items-center"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#adminCategoryFilterCollapse"
            aria-expanded="true"
            aria-controls="adminCategoryFilterCollapse"
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
          <div className="collapse show" id="adminCategoryFilterCollapse">
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              onClearCategories={clearCategories}
            />
          </div>
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Link className="btn btn-primary" to="/adminbooks/new">
              Add book
            </Link>
          </div>

          {showEditForm && (
            <BookForm
              mode="edit"
              initialBook={editingBook}
              categoryOptions={categories}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
            />
          )}

          {actionError && (
            <div className="alert alert-warning" role="alert">
              {actionError}
            </div>
          )}

          <div className="row g-3 mb-3 align-items-end">
            <div className="col-auto">
              <label htmlFor="adminPageSize" className="form-label mb-1">
                Results per page
              </label>
              <select
                id="adminPageSize"
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
              {totalCount > 0
                ? `Showing ${start}–${end} of ${totalCount}`
                : !loading
                  ? 'No books'
                  : ''}
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
                    <th className="text-end">Actions</th>
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
                      <td className="text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => {
                            setEditingBook(book)
                            setActionError(null)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteTarget(book)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <nav aria-label="Admin book pages">
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
        </div>
      </div>

      {/* Plain Bootstrap markup; no JS modal API, just controlled visibility. */}
      {deleteTarget && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-book-title"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h2 className="modal-title h5" id="admin-delete-book-title">
                    Delete this book?
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    disabled={deletePending}
                    onClick={() => setDeleteTarget(null)}
                  />
                </div>
                <div className="modal-body pt-2">
                  <p className="mb-0 text-secondary">
                    <span className="text-dark fw-medium">{deleteTarget.title}</span> will be
                    removed from the catalog permanently. This cannot be undone.
                  </p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={deletePending}
                    onClick={() => setDeleteTarget(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={deletePending}
                    onClick={confirmDelete}
                  >
                    {deletePending ? 'Deleting…' : 'Delete book'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            aria-hidden="true"
            onClick={() => {
              if (!deletePending) {
                setDeleteTarget(null)
              }
            }}
          />
        </>
      )}
    </div>
  )
}
