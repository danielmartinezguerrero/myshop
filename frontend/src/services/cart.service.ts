import type { Cart } from '../types/Cart'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// Every cart endpoint needs the JWT in the Authorization header.
// This helper keeps that logic in one place.
const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

// Shared response handling — the backend always returns the full cart
const handleResponse = async (response: Response): Promise<Cart> => {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Cart request failed')
  }

  return data
}

export const fetchCart = async (token: string): Promise<Cart> => {
  const response = await fetch(`${API_URL}/cart`, {
    headers: authHeaders(token),
  })
  return handleResponse(response)
}

export const addItemToCart = async (
  token: string,
  productId: number,
  quantity = 1
): Promise<Cart> => {
  const response = await fetch(`${API_URL}/cart/items`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ productId, quantity }),
  })
  return handleResponse(response)
}

export const updateItemQuantity = async (
  token: string,
  productId: number,
  quantity: number
): Promise<Cart> => {
  const response = await fetch(`${API_URL}/cart/items/${productId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ quantity }),
  })
  return handleResponse(response)
}

export const removeItemFromCart = async (
  token: string,
  productId: number
): Promise<Cart> => {
  const response = await fetch(`${API_URL}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return handleResponse(response)
}

export const clearCart = async (token: string): Promise<Cart> => {
  const response = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return handleResponse(response)
}