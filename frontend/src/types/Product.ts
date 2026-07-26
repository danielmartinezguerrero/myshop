// These match the shape the API returns, including nested relations

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Subcategory {
  id: number
  name: string
  slug: string
  categoryId: number
  category: Category
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: string          // Prisma Decimal arrives as a string in JSON
  imageUrl: string
  slots: number
  slotsAvailable: number
  isActive: boolean
  subcategoryId: number
  subcategory: Subcategory
  createdAt: string
  updatedAt: string
}

// Category with its subcategories — returned by /products/categories
export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[]
}