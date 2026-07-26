import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// GET /products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { category, subcategory, search } = req.query

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,

        // Only filter by subcategory slug if the param was provided
        ...(subcategory && {
          subcategory: { slug: String(subcategory) },
        }),

        // Filter by category slug
        ...(category && {
          subcategory: {
            category: { slug: String(category) },
          },
        }),

        // Case-insensitive search on name and description
        ...(search && {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' as const } },
            { description: { contains: String(search), mode: 'insensitive' as const } },
          ],
        }),
      },

      // Include related data so the frontend gets category info in one request
      include: {
        subcategory: {
          include: { category: true },
        },
      },

      orderBy: { createdAt: 'desc' },
    })

    res.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
}

// GET /products/:slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params

  try {
    const product = await prisma.product.findUnique({
      where: { slug: String(slug) },
      include: {
        subcategory: {
          include: { category: true },
        },
      },
    })

    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    res.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
}

// GET /products/categories
// Returns all categories with their subcategories — used to build nav menus
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { name: 'asc' },
    })

    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
}