import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Search input state — initialised from the URL so it survives reloads
  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = search.trim()
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">

        {/* Top row */}
        <div className="h-16 flex items-center justify-between gap-3">
          <Link to="/" className="text-xl font-bold text-gray-900 shrink-0">
            MyShop
          </Link>

          {/* Search — hidden on mobile, shown in its own row below */}
          <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subscriptions..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Orders
                </Link>

                {/* Greeting takes too much room on small screens */}
                <span className="hidden md:inline text-sm text-gray-600">
                  Hi, {user?.name.split(' ')[0]}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Search row — mobile only */}
        <form onSubmit={handleSearch} className="sm:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </header>
  )
}

export default Header
