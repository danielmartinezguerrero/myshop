import { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/User'
import { getMe } from '../services/auth.service'

interface AuthContextType {
  user: User | null
  token: string | null
  rememberMe: boolean
  isInitializing: boolean
  login: (user: User, token: string, rememberMe: boolean) => void
  logout: () => void
  isAuthenticated: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Read the stored token synchronously so there's no flash of logged-out UI
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)
  const [rememberMe, setRememberMe] = useState<boolean>(
    () => localStorage.getItem('rememberMe') === 'true'
  )

  // Only "initializing" if there's actually a token to validate.
  // The lazy initialiser avoids a setState inside the effect below.
  const [isInitializing, setIsInitializing] = useState<boolean>(
    () => Boolean(localStorage.getItem('token'))
  )

  // On mount: if a token was stored, ask the backend who it belongs to.
  // A token could be expired or tampered with, so we never trust it blindly.
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) return

    let ignore = false

    const restoreSession = async () => {
      try {
        const data = await getMe(storedToken)
        if (!ignore) setUser(data)
      } catch {
        // Invalid or expired token — clean up
        if (!ignore) {
          localStorage.removeItem('token')
          localStorage.removeItem('rememberMe')
          setToken(null)
          setRememberMe(false)
        }
      } finally {
        if (!ignore) setIsInitializing(false)
      }
    }

    restoreSession()

    return () => {
      ignore = true
    }
  }, [])

  const login = (user: User, token: string, rememberMe: boolean) => {
    setUser(user)
    setToken(token)
    setRememberMe(rememberMe)
    localStorage.setItem('token', token)
    localStorage.setItem('rememberMe', String(rememberMe))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRememberMe(false)
    localStorage.removeItem('token')
    localStorage.removeItem('rememberMe')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        rememberMe,
        isInitializing,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}