import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { loginUser } from '../services/auth.service'
import { useAuth } from '../hooks/useAuth'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Where the user was trying to go before being redirected here.
  // Falls back to home for a normal login.
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = await loginUser(email, password)
      // Pass rememberMe to the auth context
      login(data.user, data.token, rememberMe)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 flex items-start sm:items-center justify-center px-4 py-8 sm:py-12 min-h-[calc(100vh-7rem)] sm:min-h-[calc(100vh-4rem)]">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to your MyShop account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Remember me — the whole label is clickable, not just the box */}
          <label htmlFor="rememberMe" className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              // shrink-0 stops the box from being squeezed by the wrapping text,
              // mt-0.5 aligns it with the first line rather than the block centre
              className="h-4 w-4 shrink-0 mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
            />
            <span className="text-sm text-gray-600">
              Remember me — don't sign me out due to inactivity
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-gray-900 hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage