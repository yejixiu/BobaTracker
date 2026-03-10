import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(username)) {
      return res.status(400).json({ error: '用户名只能包含英文和数字，且必须以英文开头' })
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度需要3-20个字符' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6个字符' })
    }

    // Check if username exists
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    if (existing.length > 0) {
      return res.status(409).json({ error: '用户名已存在' })
    }

    const id = uuidv4()
    const hash = await bcrypt.hash(password, 10)
    await pool.execute(
      'INSERT INTO users (id, username, password, nickname, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, username, hash, nickname || username, Date.now()]
    )

    // Claim any orphan records (user_id = '')
    await pool.execute("UPDATE records SET user_id = ? WHERE user_id = ''", [id])

    const token = signToken(id)
    res.status(201).json({
      data: {
        token,
        user: { id, username, nickname: nickname || username, avatar: null }
      }
    })
  } catch (err) {
    console.error('Register failed:', err)
    res.status(500).json({ error: '注册失败' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    if (rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const token = signToken(user.id)
    res.json({
      data: {
        token,
        user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar }
      }
    })
  } catch (err) {
    console.error('Login failed:', err)
    res.status(500).json({ error: '登录失败' })
  }
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, nickname, avatar FROM users WHERE id = ?', [req.userId])
    if (rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.json({ data: rows[0] })
  } catch (err) {
    console.error('Get profile failed:', err)
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  try {
    const { nickname, avatar } = req.body
    const fields = []
    const values = []
    if (nickname !== undefined) { fields.push('nickname = ?'); values.push(nickname) }
    if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar) }
    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' })
    }
    values.push(req.userId)
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values)
    const [rows] = await pool.query('SELECT id, username, nickname, avatar FROM users WHERE id = ?', [req.userId])
    res.json({ data: rows[0] })
  } catch (err) {
    console.error('Update profile failed:', err)
    res.status(500).json({ error: '更新失败' })
  }
})

export default router
