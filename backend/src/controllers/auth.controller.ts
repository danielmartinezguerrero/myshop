import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

// POST /auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, birthday } = req.body

  // Basic validation
  if (!name || !email || !password || !birthday) {
    res.status(400).json({ error: 'All fields are required' })
    return
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  try {
    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }

    // Hash the password — never store plain text passwords
    // 10 is the "salt rounds" — higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 10)

    // Save the new user to the database
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, birthday },
    })

    // Generate a JWT valid for 7 days
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } })

    // Use the same error for "user not found" and "wrong password"
    // This prevents attackers from knowing which emails are registered
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}