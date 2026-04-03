import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchCategories } from '../api/booksApi'
import { createBook } from '../api/booksAdmin'
import { BookForm } from '../components/BookForm'
import type { BookInput } from '../types/book'

// Separate screen for creating a book so the main admin table stays uncluttered.

export function AdminAddBookPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<string[]>([])
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {
        setCategories([])
        setCategoriesError('Could not load categories. Try again later.')
      })
  }, [])

  async function handleSubmit(input: BookInput) {
    await createBook(input)
    // Flash message is read on the list page so they see a quick confirmation.
    navigate('/adminbooks', {
      state: {
        flash: {
          type: 'success' as const,
          message: 'Book added successfully.',
        },
      },
    })
  }

  function handleCancel() {
    navigate('/adminbooks')
  }

  return (
    <div className="min-vh-100 bg-body-secondary py-4">
      <div className="container" style={{ maxWidth: 960 }}>
        <div className="mb-3">
          <Link to="/adminbooks" className="btn btn-outline-secondary btn-sm">
            ← Back to admin list
          </Link>
        </div>

        <header className="mb-4">
          <h1 className="h2 mb-1">Add new book</h1>
          <p className="text-muted small mb-0">Fill in the details below.</p>
        </header>

        {categoriesError && (
          <div className="alert alert-warning" role="alert">
            {categoriesError}
          </div>
        )}

        <BookForm
          mode="add"
          initialBook={null}
          categoryOptions={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
