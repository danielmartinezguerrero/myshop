import { Router } from 'express'
import { register, login } from '../controllers/auth.controller'

// Router groups all auth-related endpoints under /auth
const router = Router()

router.post('/register', register)
router.post('/login', login)

export default router