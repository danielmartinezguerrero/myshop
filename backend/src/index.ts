import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import cartRoutes from './routes/cart.routes'
import orderRoutes from './routes/order.routes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    /^http:\/\/192\.168\.\d+\.\d+:5173$/,
  ],
}))
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/', (_req, res) => {
  res.json({
    name: 'MyShop API',
    version: '1.0.0',
    endpoints: ['/health', '/auth', '/products', '/cart', '/orders'],
  })
})

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
})