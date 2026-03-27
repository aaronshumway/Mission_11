import { Navigate, Route, Routes } from 'react-router-dom'
import { CartPage } from './pages/CartPage'
import { BooksPage } from './pages/BooksPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<BooksPage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="*" element={<Navigate to="/books" replace />} />
    </Routes>
  )
}

export default App
