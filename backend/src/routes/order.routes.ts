import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { createOrder, getOrders, getOrderByNumber } from '../controllers/order.controller'

const router = Router()

// All order routes require authentication
router.use(authMiddleware)

router.post('/', createOrder)
router.get('/', getOrders)
router.get('/:orderNumber', getOrderByNumber)

export default router