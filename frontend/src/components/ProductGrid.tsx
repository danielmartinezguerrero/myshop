import type { Product } from '../types/Product'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
  error: string | null
}

const ProductGrid = ({ products, isLoading, error }: ProductGridProps) => {
  // Loading state — skeleton placeholders instead of a spinner.
  // Skeletons reduce layout shift and feel faster to the user.
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Array.from creates an array of 6 items just to render 6 skeletons */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="aspect-4/3 bg-gray-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-4/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-xl p-8 text-center">
        <p className="text-red-700 font-medium mb-1">Couldn't load subscriptions</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  // Empty state — happens when filters match nothing
  if (products.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-900 font-medium mb-1">No subscriptions found</p>
        <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
      </div>
    )
  }

  // Success state
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        // key tells React which item is which when the list changes.
        // Always use a stable unique id, never the array index.
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid