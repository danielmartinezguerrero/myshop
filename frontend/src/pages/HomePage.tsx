import { useState, useEffect } from 'react'
import { getProducts } from '../services/product.service'
import type { Product } from '../types/Product'
import ProductGrid from '../components/ProductGrid'

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // useEffect with an empty dependency array runs once, after the first render.
  // This is where side effects like data fetching belong.
  useEffect(() => {
    // A flag to avoid setting state if the component unmounts mid-request
    let ignore = false

    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getProducts()
        if (!ignore) {
          setProducts(data)
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchProducts()

    // Cleanup: runs when the component unmounts or before the effect re-runs
    return () => {
      ignore = true
    }
  }, []) // Empty array = run once on mount

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Shared subscriptions
        </h1>
        <p className="text-gray-600">
          Split the cost of your favourite services with others.
        </p>
      </div>

      <ProductGrid products={products} isLoading={isLoading} error={error} />
    </div>
  )
}

export default HomePage