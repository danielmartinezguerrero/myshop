import { Router } from 'express'
import { getProducts, getProductBySlug, getCategories } from '../controllers/product.controller'

const router = Router()

// Otherwise Express would match "categories" as a slug parameter
router.get('/categories', getCategories)
router.get('/', getProducts)
router.get('/:slug', getProductBySlug)

export default router