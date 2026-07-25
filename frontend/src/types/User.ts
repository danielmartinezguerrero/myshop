// Represents an authenticated user
export interface User {
  id: number
  name: string
  email: string
  birthday: string
}

// Shape of the JWT response from the backend
export interface AuthResponse {
  token: string
  user: User
}