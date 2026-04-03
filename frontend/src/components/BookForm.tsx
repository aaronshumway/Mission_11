import { useEffect, useMemo, useState } from 'react'
import type { Book, BookInput } from '../types/book'

const emptyInput: BookInput = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 1,
  price: 0,
}

interface BookFormProps {
  mode: 'add' | 'edit'
  initialBook: Book | null
  // Pulled from the API so the category list lines up with filters.
  categoryOptions: string[]
  onSubmit: (input: BookInput) => Promise<void>
  onCancel: () => void
}

export function BookForm({
  mode,
  initialBook,
  categoryOptions,
  onSubmit,
  onCancel,
}: BookFormProps) {
  const [formData, setFormData] = useState<BookInput>(emptyInput)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && initialBook) {
      setFormData({
        title: initialBook.title,
        author: initialBook.author,
        publisher: initialBook.publisher,
        isbn: initialBook.isbn,
        classification: initialBook.classification,
        category: initialBook.category,
        pageCount: initialBook.pageCount,
        price: initialBook.price,
      })
    } else {
      setFormData(emptyInput)
    }
  }, [mode, initialBook])

  // If an old book has a category that disappeared from the list, keep it selectable.
  const categoryChoices = useMemo(() => {
    const set = new Set(categoryOptions)
    if (mode === 'edit' && initialBook?.category) {
      set.add(initialBook.category)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [categoryOptions, mode, initialBook])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target
    if (type === 'number') {
      const n = Number.parseFloat(value)
      setFormData((prev) => ({
        ...prev,
        [name]: Number.isNaN(n) ? 0 : n,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      className="card mb-4"
      onSubmit={handleSubmit}
      aria-labelledby="book-form-heading"
    >
      <div className="card-header">
        <h2 className="h6 mb-0" id="book-form-heading">
          {mode === 'add' ? 'Add new book' : 'Edit book'}
        </h2>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="book-title">
              Title
            </label>
            <input
              id="book-title"
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="book-author">
              Author
            </label>
            <input
              id="book-author"
              className="form-control"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="book-publisher">
              Publisher
            </label>
            <input
              id="book-publisher"
              className="form-control"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="book-isbn">
              ISBN
            </label>
            <input
              id="book-isbn"
              className="form-control"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="book-classification">
              Classification
            </label>
            <input
              id="book-classification"
              className="form-control"
              name="classification"
              value={formData.classification}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="book-category">
              Category
            </label>
            <select
              id="book-category"
              className="form-select"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={categoryChoices.length === 0}
            >
              <option value="" disabled>
                {categoryChoices.length === 0 ? 'Loading categories…' : 'Select a category'}
              </option>
              {categoryChoices.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="book-pageCount">
              Page count
            </label>
            <input
              id="book-pageCount"
              className="form-control"
              name="pageCount"
              type="number"
              min={1}
              value={formData.pageCount || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="book-price">
              Price
            </label>
            <input
              id="book-price"
              className="form-control"
              name="price"
              type="number"
              min={0}
              step="0.01"
              value={formData.price || ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
      <div className="card-footer d-flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'add' ? 'Add book' : 'Save changes'}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
