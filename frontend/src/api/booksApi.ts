import { API_BASE } from '../apiConfig'
import type { PagedBooksResponse } from '../types/book'

// Read-only book calls used by the storefront and admin list.

export async function fetchBooksPage(
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<PagedBooksResponse> {
  const res = await fetch(`${API_BASE}/api/books?${params.toString()}`, {
    signal,
  })
  if (!res.ok) {
    throw new Error(`Failed to load books (${res.status})`)
  }
  return res.json() as Promise<PagedBooksResponse>
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/books/categories`)
  if (!res.ok) {
    throw new Error('Failed to load categories')
  }
  return res.json() as Promise<string[]>
}
