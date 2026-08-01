import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

const CartPage = () => {
  const {
    cart,
    isLoading,
    pendingProductId,
    error,
    itemCount,
    totalPrice,
    updateQuantity,
    removeItem,
    clear,
    clearError,
  } = useCart()

  // First load — cart is still null
  if (isLoading && !cart) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-8 bg-gray-100 rounded w-1/4 mb-8 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Your cart
          {itemCount > 0 && (
            <span className="text-gray-400 font-normal text-xl sm:text-2xl ml-2">({itemCount})</span>
          )}
        </h1>

        {!isEmpty && (
          <button
            onClick={clear}
            disabled={isLoading}
            className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            Clear cart
          </button>
        )}
      </div>

      {/* Error banner — dismissible */}
      {error && (
        <div className="flex items-start justify-between gap-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-800 shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {isEmpty ? (
        <div className="border border-gray-200 rounded-xl p-8 sm:p-12 text-center">
          <p className="text-gray-900 font-medium mb-1">Your cart is empty</p>
          <p className="text-gray-500 text-sm mb-6">Browse subscriptions and add a slot.</p>
          <Link
            to="/"
            className="inline-block bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Browse subscriptions
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const unitPrice = Number(item.product.price)
              const lineTotal = unitPrice * item.quantity
              const canIncrease = item.quantity < item.product.slotsAvailable

              // Only this row is busy — the other rows stay interactive
              const isPending = pendingProductId === item.productId

              return (
                <div
                  key={item.id}
                  className={`flex gap-3 sm:gap-4 border border-gray-200 rounded-xl p-4 transition-opacity ${
                    isPending ? 'opacity-50' : ''
                  }`}
                >
                  <Link to={`/products/${item.product.slug}`} className="shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-14 sm:w-24 sm:h-20 object-cover rounded-lg bg-gray-100"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-500">
                      {item.product.subcategory.category.name} · {item.product.subcategory.name}
                    </span>

                    <Link
                      to={`/products/${item.product.slug}`}
                      className="block font-medium text-gray-900 hover:underline truncate"
                    >
                      {item.product.name}
                    </Link>

                    <span className="text-sm text-gray-500">
                      €{unitPrice.toFixed(2)} /month per slot
                    </span>

                    {/* Stacks on mobile so nothing overflows the card */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-gray-200 rounded-lg self-start">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={isPending || item.quantity <= 1}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-3 text-sm tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={isPending || !canIncrease}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="font-medium text-gray-900">
                          €{lineTotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          disabled={isPending}
                          className="text-sm text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary — sticky on desktop */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-xl p-5 lg:sticky lg:top-24">
              <h2 className="font-medium text-gray-900 mb-4">Order summary</h2>

              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Slots</span>
                <span>{itemCount}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600 pb-4 border-b border-gray-200">
                <span>Billing</span>
                <span>Monthly</span>
              </div>

              <div className="flex justify-between items-baseline py-4">
                <span className="font-medium text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">
                    €{totalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500"> /month</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block text-center w-full bg-gray-900 hover:bg-gray-700 text-white font-medium rounded-lg py-3 transition-colors"
              >
                Checkout
              </Link>

              <Link
                to="/"
                className="block text-center text-sm text-gray-500 hover:text-gray-900 mt-3 transition-colors"
              >
                Continue browsing
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage