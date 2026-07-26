import { createContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/User'

interface AuthContextType {
  user: User | null
  token: string | null
  rememberMe: boolean
  login: (user: User, token: string, rememberMe: boolean) => void
  logout: () => void
  isAuthenticated: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState<boolean>(false)

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
    <AuthContext.Provider value={{ user, token, rememberMe, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}