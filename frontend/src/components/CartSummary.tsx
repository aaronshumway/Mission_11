import { Link } from 'react-router-dom'

interface CartSummaryProps {
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

export function CartSummary({ totalItems, totalPrice, cartLink }: CartSummaryProps) {
  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h6 mb-3">Cart Summary</h2>
        <p className="mb-1">Items: {totalItems}</p>
        <p className="mb-3">Total: {formatCurrency(totalPrice)}</p>
        <Link className="btn btn-primary btn-sm" to={cartLink}>
          View Cart
        </Link>
      </div>
    </div>
  )
}
