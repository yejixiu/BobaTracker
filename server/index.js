import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDB } from './db.js'
import { authMiddleware } from './middleware/auth.js'
import authRouter from './routes/auth.js'
import recordsRouter from './routes/records.js'
import brandsRouter from './routes/brands.js'
import sweetnessRouter from './routes/sweetness.js'
import toppingsRouter from './routes/toppings.js'
import settingsRouter from './routes/settings.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Auth middleware - skip register/login
app.use('/api', (req, res, next) => {
  const publicPaths = ['/auth/register', '/auth/login']
  if (publicPaths.includes(req.path)) {
    return next()
  }
  authMiddleware(req, res, next)
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/records', recordsRouter)
app.use('/api/brands', brandsRouter)
app.use('/api/sweetness', sweetnessRouter)
app.use('/api/toppings', toppingsRouter)
app.use('/api/settings', settingsRouter)

try {
  await initDB()
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
} catch (err) {
  console.error('Failed to start server:', err)
  process.exit(1)
}
