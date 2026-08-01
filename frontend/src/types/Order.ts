import type { Product } from './Product'

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export interface OrderItem {
  id: number
  quantity: number
  // Snapshot values from when the order was placed
  unitPrice: string
  productName: string
  orderId: number
  productId: number
  product: Product
  createdAt: string
}

export interface Order {
  id: number
  orderNumber: string
  status: OrderStatus
  total: string
  items: OrderItem[]
  userId: number
  createdAt: string
  updatedAt: string
}