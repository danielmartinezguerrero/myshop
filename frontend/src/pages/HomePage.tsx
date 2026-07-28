import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../services/product.service'
import type { Product } from '../types/Product'
import ProductGrid from '../components/ProductGrid'

const HomePage = () => {
  // useSearchParams reads and writes the query string (?search=netflix)
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Only send the search param if there's actually a term
        const data = await getProducts(search ? { search } : {})
        if (!ignore) setProducts(data)
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    fetchProducts()

    return () => {
      ignore = true
    }
    // search is a dependency: a new search term triggers a new fetch
  }, [search])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        {search ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Results for "{search}"
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-gray-600">
                {isLoading
                  ? 'Searching...'
                  : `${products.length} subscription${products.length !== 1 ? 's' : ''} found`}
              </p>
              <Link to="/" className="text-sm text-gray-900 underline hover:no-underline">
                Clear search
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shared subscriptions
            </h1>
            <p className="text-gray-600">
              Split the cost of your favourite services with others.
            </p>
          </>
        )}
      </div>

      <ProductGrid products={products} isLoading={isLoading} error={error} />
    </div>
  )
}

export default HomePage