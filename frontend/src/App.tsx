import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminAddBookPage } from './pages/AdminAddBookPage'
import { AdminBooksPage } from './pages/AdminBooksPage'
import { CartPage } from './pages/CartPage'
import { BooksPage } from './pages/BooksPage'

// Main URL map. Admin lives under /adminbooks; unknown paths go back to the store.
function App() {
  return (
    <Routes>
      <Route path="/" element={<BooksPage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/adminbooks/new" element={<AdminAddBookPage />} />
      <Route path="/adminbooks" element={<AdminBooksPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="*" element={<Navigate to="/books" replace />} />
    </Routes>
  )
}

export default App
