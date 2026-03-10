import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'naicha_secret_key_2024'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' })
  }
  try {
    const token = header.slice(7)
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch (e) {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}
