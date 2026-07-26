import { Link } from 'react-router-dom'
import type { Product } from '../types/Product'

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Derived values — calculated from props, not stored in state
  const isSoldOut = product.slotsAvailable === 0
  const isLastSlot = product.slotsAvailable === 1

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-gray-400 transition-colors flex flex-col"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          // Lazy loading: the browser only downloads images as they scroll into view
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category label */}
        <span className="text-xs text-gray-500 mb-1">
          {product.subcategory.category.name} · {product.subcategory.name}
        </span>

        <h3 className="font-medium text-gray-900 mb-1 group-hover:underline">
          {product.name}
        </h3>

        {/* line-clamp-2 truncates the text after two lines */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Footer: price + availability */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="text-lg font-semibold text-gray-900">
              €{Number(product.price).toFixed(2)}
            </span>
            <span className="text-xs text-gray-500"> /month</span>
          </div>

          {/* Availability badge — three possible states */}
          {isSoldOut ? (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
              Sold out
            </span>
          ) : isLastSlot ? (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
              Last slot
            </span>
          ) : (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md">
              {product.slotsAvailable} slots left
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard