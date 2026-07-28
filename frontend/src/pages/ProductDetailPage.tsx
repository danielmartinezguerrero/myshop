import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductBySlug } from '../services/product.service'
import type { Product } from '../types/Product'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { isAuthenticated } = useAuth()
  const {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    pendingProductId,
    error: cartError,
  } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (product) {
      addItem(product.id)
    }
  }

  useEffect(() => {
    if (!slug) return

    let ignore = false

    const fetchProduct = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getProductBySlug(slug)
        if (!ignore) setProduct(data)
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    fetchProduct()

    return () => {
      ignore = true
    }
  }, [slug])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-4/3 bg-gray-100 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
            <div className="h-10 bg-gray-100 rounded w-1/3 animate-pulse mt-8" />
          </div>
        </div>
      </div>
    )
  }

  // Error / not found
  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription not found</h1>
        <p className="text-gray-600 mb-6">
          This subscription may have been removed or the link is incorrect.
        </p>
        <Link
          to="/"
          className="inline-block bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Back to all subscriptions
        </Link>
      </div>
    )
  }

  const isSoldOut = product.slotsAvailable === 0
  const slotsTaken = product.slots - product.slotsAvailable
  const fillPercentage = (slotsTaken / product.slots) * 100

  // How many of THIS product the user already has in their cart
  const cartItem = cart?.items.find((item) => item.productId === product.id)
  const quantityInCart = cartItem?.quantity ?? 0

  const remaining = product.slotsAvailable - quantityInCart
  const canAddMore = remaining > 0
  const isInCart = quantityInCart > 0

  // Only true while an action on THIS product is in flight
  const isPending = pendingProductId === product.id

  // At quantity 1, decreasing means removing the item entirely
  const handleDecrease = () => {
    if (quantityInCart <= 1) {
      removeItem(product.id)
    } else {
      updateQuantity(product.id, quantityInCart - 1)
    }
  }

  const handleIncrease = () => {
    updateQuantity(product.id, quantityInCart + 1)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back button + breadcrumb */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900">All subscriptions</Link>
          <span className="mx-2">/</span>
          <span>{product.subcategory.category.name}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.subcategory.name}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-4/3 bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 mb-2">
            {product.subcategory.category.name} · {product.subcategory.name}
          </span>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-gray-900">
              €{Number(product.price).toFixed(2)}
            </span>
            <span className="text-gray-500"> /month per slot</span>
          </div>

          {/* Slot availability with a visual progress bar */}
          <div className="border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-900">Slot availability</span>
              <span className="text-sm text-gray-600">
                {slotsTaken} of {product.slots} taken
              </span>
            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  isSoldOut ? 'bg-gray-400' : 'bg-green-500'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>

            <p className="text-sm text-gray-600">
              {isSoldOut
                ? 'All slots are currently taken.'
                : `${product.slotsAvailable} slot${product.slotsAvailable !== 1 ? 's' : ''} available right now.`}
            </p>
          </div>

          {/* Limit reached notice */}
          {isInCart && !canAddMore && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
              You've added every available slot for this subscription.
            </p>
          )}

          {/* Cart error from the backend */}
          {cartError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-3 text-sm">
              {cartError}
            </div>
          )}

          {/* Stepper if it's already in the cart, add button otherwise */}
          {isInCart ? (
            <div
              className={`border border-gray-900 rounded-xl p-4 transition-opacity ${
                isPending ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-sm text-gray-600">In your cart</span>

                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={handleDecrease}
                    disabled={isPending}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                    aria-label={quantityInCart <= 1 ? 'Remove from cart' : 'Decrease quantity'}
                  >
                    −
                  </button>

                  <span className="px-4 text-sm font-medium tabular-nums min-w-10 text-center">
                    {quantityInCart}
                  </span>

                  <button
                    onClick={handleIncrease}
                    disabled={isPending || !canAddMore}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Subtotal{' '}
                  <strong className="text-gray-900">
                    €{(Number(product.price) * quantityInCart).toFixed(2)}
                  </strong>
                  <span className="text-gray-500"> /month</span>
                </span>

                <Link
                  to="/cart"
                  className="text-sm text-gray-900 underline hover:no-underline shrink-0"
                >
                  View cart
                </Link>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut || isPending}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg py-3 transition-colors"
            >
              {isSoldOut ? 'Sold out' : isPending ? 'Adding...' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage