import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchOrders } from '../services/order.service'
import type { Order } from '../types/Order'

const OrdersPage = () => {
  const { token } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    let ignore = false

    const load = async () => {
      try {
        const data = await fetchOrders(token)
        if (!ignore) setOrders(data)
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [token])

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-8 bg-gray-100 rounded w-1/3 mb-8 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your orders</h1>
        <div className="border border-red-200 bg-red-50 rounded-xl p-8 text-center">
          <p className="text-red-700 font-medium mb-1">Couldn't load your orders</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your orders</h1>

      {orders.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-900 font-medium mb-1">No orders yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Your subscription purchases will appear here.
          </p>
          <Link
            to="/"
            className="inline-block bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Browse subscriptions
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const placedAt = new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            const slotCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

            return (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.orderNumber}`}
                  className="block border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {placedAt} · {slotCount} slot{slotCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        €{Number(order.total).toFixed(2)}
                        <span className="text-sm text-gray-500 font-normal"> /month</span>
                      </p>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-md font-medium mt-1">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Product thumbnails — a quick visual cue of what's in the order */}
                  <div className="flex items-center gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <img
                        key={item.id}
                        src={item.product.imageUrl}
                        alt={item.productName}
                        className="w-12 h-10 object-cover rounded-md bg-gray-100"
                      />
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-sm text-gray-500">
                        +{order.items.length - 4} more
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default OrdersPage