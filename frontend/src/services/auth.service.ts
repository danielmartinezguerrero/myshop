import type { AuthResponse } from '../types/User'
import type { User } from '../types/User'

const API_URL = 'http://localhost:3001'

// Register a new user
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  birthday: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, birthday }),
  })

  const data = await response.json()

  // If the server returned an error, throw it so the form can show it
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed')
  }

  return data
}

// Login an existing user
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Login failed')
  }

  return data
}

// Validates a stored token and returns the user it belongs to
export const getMe = async (token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Session expired')
  }

  return data
}