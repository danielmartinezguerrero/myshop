import type { Product } from './Product'

export interface CartItem {
  id: number
  quantity: number
  cartId: number
  productId: number
  product: Product
  createdAt: string
  updatedAt: string
}

export interface Cart {
  id: number
  userId: number
  items: CartItem[]
  createdAt: string
  updatedAt: string
}