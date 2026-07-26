import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  // Search input state
  const [search, setSearch] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', search)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-gray-900 shrink-0">
          MyShop
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
            />
            {/* Search icon */}
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Right side — cart + auth */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Cart button — always visible */}
          <Link
            to="/cart"
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11" />
            </svg>
            {/* Cart badge — we'll make this dynamic when we build the cart */}
            <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Auth buttons — changes based on login state */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Hi, {user?.name.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header