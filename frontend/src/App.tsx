import { BookList } from './BookList'
import './App.css'

function App() {
  return (
    <div className="container py-4 text-start">
      <header className="mb-4">
        <h1 className="h2 mb-0">Online Bookstore</h1>
      </header>
      <BookList />
    </div>
  )
}

export default App
