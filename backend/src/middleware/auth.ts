import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Extend Express's Request type to include our user data
export interface AuthRequest extends Request {
  userId?: number
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  try {
    // Verify the token and extract the payload
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }
    req.userId = payload.userId
    next() // Token is valid, continue to the route handler
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}