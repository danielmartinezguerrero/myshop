import { createContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Cart } from '../types/Cart'
import { useAuth } from '../hooks/useAuth'
import * as cartService from '../services/cart.service'

interface CartContextType {
  cart: Cart | null
  isLoading: boolean              // any cart action in flight
  pendingProductId: number | null // which product is being changed right now
  error: string | null
  itemCount: number
  totalPrice: number
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  clear: () => Promise<void>
  clearError: () => void
  refreshCart: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext<CartContextType | null>(null)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth()

  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Which product currently has an action in flight — null when idle.
  // Lets each row show its own busy state instead of freezing the whole cart.
  const [pendingProductId, setPendingProductId] = useState<number | null>(null)

  // Load the cart whenever the user logs in
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return
    }

    let ignore = false

    const loadCart = async () => {
      setIsLoading(true)
      try {
        const data = await cartService.fetchCart(token)
        if (!ignore) setCart(data)
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load cart')
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadCart()

    return () => {
      ignore = true
    }
  }, [isAuthenticated, token])

  // Wraps every cart mutation: handles loading, errors, and updating state.
  // productId is optional — actions that affect the whole cart don't pass one.
  const runAction = useCallback(
    async (action: (token: string) => Promise<Cart>, productId?: number) => {
      if (!token) {
        setError('You need to sign in first')
        return
      }

      setIsLoading(true)
      setPendingProductId(productId ?? null)
      setError(null)

      try {
        // The backend returns the full updated cart, so we just replace state.
        // No manual syncing — the server is the single source of truth.
        const updated = await action(token)
        setCart(updated)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
        setPendingProductId(null)
      }
    },
    [token]
  )

  const addItem = useCallback(
    (productId: number, quantity = 1) =>
      runAction((t) => cartService.addItemToCart(t, productId, quantity), productId),
    [runAction]
  )

  const updateQuantity = useCallback(
    (productId: number, quantity: number) =>
      runAction((t) => cartService.updateItemQuantity(t, productId, quantity), productId),
    [runAction]
  )

  const removeItem = useCallback(
    (productId: number) =>
      runAction((t) => cartService.removeItemFromCart(t, productId), productId),
    [runAction]
  )

  // No productId: clearing affects the whole cart, so blocking everything is correct
  const clear = useCallback(
    () => runAction((t) => cartService.clearCart(t)),
    [runAction]
  )

  const clearError = useCallback(() => setError(null), [])

  // Re-fetch the cart from the server. Used after checkout, when the backend
  // has emptied it and our local copy is stale.
  const refreshCart = useCallback(async () => {
    if (!token) return

    try {
      const data = await cartService.fetchCart(token)
      setCart(data)
    } catch {
      // Non-critical — the user is navigating away anyway
    }
  }, [token])

  // If the user isn't authenticated, there is no cart to show — regardless of
  // what's left in state. Deriving this avoids clearing state inside an effect.
  const visibleCart = isAuthenticated ? cart : null

  const itemCount = visibleCart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const totalPrice =
    visibleCart?.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    ) ?? 0

  return (
    <CartContext.Provider
      value={{
        cart: visibleCart,
        isLoading,
        pendingProductId,
        error,
        itemCount,
        totalPrice,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        clearError,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}