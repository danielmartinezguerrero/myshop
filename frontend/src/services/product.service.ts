import type { Product, CategoryWithSubcategories } from '../types/Product'

const API_URL = 'http://localhost:3001'

// Optional filters for the product list
interface ProductFilters {
  category?: string
  subcategory?: string
  search?: string
}

// Fetch products, optionally filtered
export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  // URLSearchParams builds the query string safely (handles encoding for us)
  const params = new URLSearchParams()

  if (filters.category) params.append('category', filters.category)
  if (filters.subcategory) params.append('subcategory', filters.subcategory)
  if (filters.search) params.append('search', filters.search)

  const queryString = params.toString()
  const url = queryString ? `${API_URL}/products?${queryString}` : `${API_URL}/products`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to load products')
  }

  return response.json()
}

// Fetch a single product by its slug
export const getProductBySlug = async (slug: string): Promise<Product> => {
  const response = await fetch(`${API_URL}/products/${slug}`)

  if (!response.ok) {
    throw new Error('Product not found')
  }

  return response.json()
}

// Fetch all categories with their subcategories — for nav menus and filters
export const getCategories = async (): Promise<CategoryWithSubcategories[]> => {
  const response = await fetch(`${API_URL}/products/categories`)

  if (!response.ok) {
    throw new Error('Failed to load categories')
  }

  return response.json()
}