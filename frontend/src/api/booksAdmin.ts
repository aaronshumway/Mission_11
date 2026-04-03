import { API_BASE } from '../apiConfig'
import type { Book, BookInput } from '../types/book'

// Admin mutations: these hit the same /api/books endpoints as the ASP.NET controller.

export async function createBook(input: BookInput): Promise<Book> {
  try {
    const response = await fetch(`${API_BASE}/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Failed to add book (${response.status})`)
    }

    return (await response.json()) as Book
  } catch (error) {
    console.error('Error adding book:', error)
    throw error
  }
}

export async function updateBook(bookId: number, input: BookInput): Promise<Book> {
  try {
    const response = await fetch(`${API_BASE}/api/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Failed to update book (${response.status})`)
    }

    return (await response.json()) as Book
  } catch (error) {
    console.error('Error updating book:', error)
    throw error
  }
}

export async function deleteBook(bookId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/books/${bookId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete book (${response.status})`)
    }
  } catch (error) {
    console.error('Error deleting book:', error)
    throw error
  }
}
