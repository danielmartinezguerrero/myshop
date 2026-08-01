import { Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

// Human-readable order reference, e.g. MS-20260728-8F3K2
const generateOrderNumber = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `MS-${date}-${random}`
}

const orderInclude = {
  items: {
    include: {
      product: {
        include: { subcategory: { include: { category: true } } },
      },
    },
  },
}

// POST /orders, turns the user's cart into an order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!

  try {
    // $transaction: every query inside either all succeeds or all rolls back.
    // Essential here, we must never take payment-worthy action on some rows
    // and fail on others, leaving slots decremented but no order created.
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      })

      if (!cart || cart.items.length === 0) {
        throw new Error('EMPTY_CART')
      }

      // Re-check availability inside the transaction.
      // The frontend already checks, but slots may have been taken since then.
      for (const item of cart.items) {
        // Read the product fresh — cart.item.product could be stale
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (!product || !product.isActive) {
          throw new Error(`UNAVAILABLE:${item.product.name}`)
        }

        if (product.slotsAvailable < item.quantity) {
          throw new Error(`INSUFFICIENT:${product.name}:${product.slotsAvailable}`)
        }
      }

      // Total is calculated server-side from current prices.
      // Never trust a total sent by the client.
      const total = cart.items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      )

      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          total,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              // Snapshot of the values at purchase time
              unitPrice: item.product.price,
              productName: item.product.name,
            })),
          },
        },
        include: orderInclude,
      })

      // Decrement available slots. `decrement` makes the database do the maths,
      // which is atomic — two concurrent orders can't both read the same value.
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { slotsAvailable: { decrement: item.quantity } },
        })
      }

      // Empty the cart — the items now live in the order
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return created
    })

    res.status(201).json(order)
  } catch (error) {
    // Translate internal error codes into user-facing messages
    if (error instanceof Error) {
      if (error.message === 'EMPTY_CART') {
        res.status(400).json({ error: 'Your cart is empty' })
        return
      }

      if (error.message.startsWith('UNAVAILABLE:')) {
        const name = error.message.split(':')[1]
        res.status(409).json({ error: `${name} is no longer available` })
        return
      }

      if (error.message.startsWith('INSUFFICIENT:')) {
        const [, name, available] = error.message.split(':')
        res.status(409).json({
          error: `Only ${available} slot(s) left for ${name}. Please update your cart.`,
        })
        return
      }
    }

    console.error('Create order error:', error)
    res.status(500).json({ error: 'Failed to place order' })
  }
}

// GET /orders, the user's order history
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId! },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    })

    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to load orders' })
  }
}

// GET /orders/:orderNumber
export const getOrderByNumber = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderNumber } = req.params

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: String(orderNumber) },
      include: orderInclude,
    })

    // Check ownership, never let a user read someone else's order
    // by guessing an order number
    if (!order || order.userId !== req.userId) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to load order' })
  }
}