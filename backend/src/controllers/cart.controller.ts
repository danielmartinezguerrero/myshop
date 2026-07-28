import { Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

// Shared shape for all cart responses — always include product details
// so the frontend can render the cart without extra requests
const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          subcategory: { include: { category: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
}

// Finds the user's cart, creating an empty one if it doesn't exist yet.
// This avoids null checks everywhere else.
const getOrCreateCart = async (userId: number) => {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  })

  if (existing) return existing

  return prisma.cart.create({
    data: { userId },
    include: cartInclude,
  })
}


// GET /cart
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await getOrCreateCart(req.userId!)
    res.json(cart)
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({ error: 'Failed to load cart' })
  }
}

// POST /cart/items  { productId, quantity? }
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, quantity = 1 } = req.body

  if (!productId) {
    res.status(400).json({ error: 'productId is required' })
    return
  }

  if (quantity < 1) {
    res.status(400).json({ error: 'Quantity must be at least 1' })
    return
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } })

    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    if (product.slotsAvailable === 0) {
      res.status(409).json({ error: 'This subscription is sold out' })
      return
    }

    const cart = await getOrCreateCart(req.userId!)

    // How many of this product are already in the cart?
    const existingItem = cart.items.find((item) => item.productId === productId)
    const currentQuantity = existingItem?.quantity ?? 0

    // Never let the cart hold more slots than actually exist
    if (currentQuantity + quantity > product.slotsAvailable) {
      res.status(409).json({
        error: `Only ${product.slotsAvailable} slot(s) available`,
      })
      return
    }

    // upsert: update if the row exists, create it otherwise.
    // Relies on the @@unique([cartId, productId]) constraint.
    await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    })

    const updatedCart = await getOrCreateCart(req.userId!)
    res.status(201).json(updatedCart)
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({ error: 'Failed to add item to cart' })
  }
}

// PATCH /cart/items/:productId  { quantity }
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const productId = Number(req.params.productId)
  const { quantity } = req.body

  if (!Number.isInteger(quantity) || quantity < 1) {
    res.status(400).json({ error: 'Quantity must be a positive integer' })
    return
  }

  try {
    const cart = await getOrCreateCart(req.userId!)
    const item = cart.items.find((item) => item.productId === productId)

    if (!item) {
      res.status(404).json({ error: 'Item not in cart' })
      return
    }

    if (quantity > item.product.slotsAvailable) {
      res.status(409).json({
        error: `Only ${item.product.slotsAvailable} slot(s) available`,
      })
      return
    }

    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    })

    const updatedCart = await getOrCreateCart(req.userId!)
    res.json(updatedCart)
  } catch (error) {
    console.error('Update cart item error:', error)
    res.status(500).json({ error: 'Failed to update item' })
  }
}

// DELETE /cart/items/:productId
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const productId = Number(req.params.productId)

  try {
    const cart = await getOrCreateCart(req.userId!)

    // deleteMany doesn't throw if nothing matches — simpler than checking first
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    })

    const updatedCart = await getOrCreateCart(req.userId!)
    res.json(updatedCart)
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({ error: 'Failed to remove item' })
  }
}

// DELETE /cart
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await getOrCreateCart(req.userId!)
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    const updatedCart = await getOrCreateCart(req.userId!)
    res.json(updatedCart)
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({ error: 'Failed to clear cart' })
  }
}