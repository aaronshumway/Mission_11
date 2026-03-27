import { Link } from 'react-router-dom'
import type { CartItem } from '../types/book'

interface CartOffcanvasProps {
  cartItems: CartItem[]
  totalItems: number
  totalPrice: number
  cartLink: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function CartOffcanvas({
  cartItems,
  totalItems,
  totalPrice,
  cartLink,
}: CartOffcanvasProps) {
  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex={-1}
      id="cartPreview"
      aria-labelledby="cartPreviewLabel"
    >
      <div className="offcanvas-header">
        <h2 className="offcanvas-title h5 mb-0" id="cartPreviewLabel">
          Cart preview
        </h2>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />
      </div>
      <div className="offcanvas-body d-flex flex-column">
        {cartItems.length === 0 ? (
          <p className="text-muted mb-0">Your cart is empty.</p>
        ) : (
          <ul className="list-unstyled flex-grow-1 mb-3">
            {cartItems.map((item) => (
              <li
                key={item.bookId}
                className="border-bottom pb-2 mb-2 d-flex justify-content-between gap-2"
              >
                <div className="min-w-0">
                  <div className="fw-medium text-truncate" title={item.title}>
                    {item.title}
                  </div>
                  <div className="small text-muted">
                    {formatCurrency(item.price)} × {item.quantity}
                  </div>
                </div>
                <div className="text-nowrap small">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto border-top pt-3">
          <p className="mb-1 small">Items: {totalItems}</p>
          <p className="mb-3 fw-semibold">Total: {formatCurrency(totalPrice)}</p>
          <Link to={cartLink} className="btn btn-primary w-100">
            View full cart
          </Link>
        </div>
      </div>
    </div>
  )
}
