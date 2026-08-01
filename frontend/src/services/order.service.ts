import type { Order } from '../types/Order'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

// Turns the current cart into an order. No body needed
// the backend reads the cart from the authenticated user.
export const placeOrder = async (token: string): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(token),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to place order')
  }

  return data
}

export const fetchOrders = async (token: string): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/orders`, {
    headers: authHeaders(token),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load orders')
  }

  return data
}

export const fetchOrderByNumber = async (
  token: string,
  orderNumber: string
): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders/${orderNumber}`, {
    headers: authHeaders(token),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Order not found')
  }

  return data
}