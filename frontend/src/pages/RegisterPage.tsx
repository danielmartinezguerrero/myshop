import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { registerUser } from '../services/auth.service'
import { useAuth } from '../hooks/useAuth'

const RegisterPage = () => {
  // useNavigate lets us redirect the user programmatically
  const navigate = useNavigate()
  const location = useLocation()

  // Where the user was trying to go before being redirected here.
  // Falls back to home for a normal registration.
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
  const { login } = useAuth()

  // One state per form field
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthday, setBirthday] = useState('')

  // UI states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the browser from reloading the page on form submit
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Call the backend via our service
      const data = await registerUser(name, email, password, birthday)

      // Save the user and token in the global auth context.
      // false: registration doesn't offer a "remember me" option
      login(data.user, data.token, false)

      navigate(from, { replace: true })
    } catch (err) {
      // Show the error message from the backend (e.g. "Email already registered")
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 flex items-start sm:items-center justify-center px-4 py-8 sm:py-12 min-h-[calc(100vh-7rem)] sm:min-h-[calc(100vh-4rem)]">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create an account</h1>
        <p className="text-gray-500 text-sm mb-6">Join MyShop and start sharing subscriptions</p>

        {/* Error message, only shown if there's an error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Daniel Martinez"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
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
              placeholder="Min. 8 characters"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birthday
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage