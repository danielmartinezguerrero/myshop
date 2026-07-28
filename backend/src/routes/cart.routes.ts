import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller'

const router = Router()

// Every cart route requires a valid JWT.
// Applying the middleware once here covers all routes below it.
router.use(authMiddleware)

router.get('/', getCart)
router.post('/items', addToCart)
router.patch('/items/:productId', updateCartItem)
router.delete('/items/:productId', removeFromCart)
router.delete('/', clearCart)

export default router