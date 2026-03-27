import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function CartPage() {
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } =
    useCart()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') ?? '/books'

  return (
    <div className="container py-4 text-start">
      <header className="mb-4">
        <h1 className="h3 mb-0">Shopping Cart</h1>
      </header>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          {cartItems.length === 0 ? (
            <div className="alert alert-secondary">Your cart is empty.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Book</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Quantity</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.bookId}>
                      <td>{item.title}</td>
                      <td className="text-end">{formatCurrency(item.price)}</td>
                      <td className="text-end" style={{ maxWidth: 120 }}>
                        <input
                          type="number"
                          min={1}
                          className="form-control form-control-sm text-end"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.bookId, Number.parseInt(e.target.value, 10) || 1)
                          }
                        />
                      </td>
                      <td className="text-end">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item.bookId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h2 className="h6">Order Summary</h2>
              <p className="mb-1">Items: {totalItems}</p>
              <p className="mb-3">Total: {formatCurrency(totalPrice)}</p>
              <div className="d-grid gap-2">
                <Link to={returnTo} className="btn btn-primary">
                  Continue Shopping
                </Link>
                <button type="button" className="btn btn-outline-secondary" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
