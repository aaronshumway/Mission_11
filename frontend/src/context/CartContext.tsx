import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '../types/book'

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: { bookId: number; title: string; price: number }) => void
  updateQuantity: (bookId: number, quantity: number) => void
  removeFromCart: (bookId: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CART_KEY = 'bookstore_cart'
const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const raw = sessionStorage.getItem(CART_KEY)
    if (!raw) {
      return []
    }
    try {
      return JSON.parse(raw) as CartItem[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  function addToCart(item: { bookId: number; title: string; price: number }) {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.bookId === item.bookId)
      if (existing) {
        return prev.map((p) =>
          p.bookId === item.bookId ? { ...p, quantity: p.quantity + 1 } : p,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function updateQuantity(bookId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(bookId)
      return
    }
    setCartItems((prev) =>
      prev.map((p) => (p.bookId === bookId ? { ...p, quantity } : p)),
    )
  }

  function removeFromCart(bookId: number) {
    setCartItems((prev) => prev.filter((p) => p.bookId !== bookId))
  }

  function clearCart() {
    setCartItems([])
  }

  const totals = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )
    return { totalItems, totalPrice }
  }, [cartItems])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems: totals.totalItems,
        totalPrice: totals.totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
