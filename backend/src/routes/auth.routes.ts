import { Router } from 'express'
import { register, login, getMe } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)

// Protected: needs a valid JWT
router.get('/me', authMiddleware, getMe)

export default router