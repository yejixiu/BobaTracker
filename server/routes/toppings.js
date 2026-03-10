import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db.js'

const router = Router()

// GET /api/toppings - 获取用户自定义小料
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_toppings WHERE user_id = ? ORDER BY sort_order ASC',
      [req.userId]
    )
    res.json({ data: rows })
  } catch (err) {
    console.error('Failed to fetch toppings:', err)
    res.status(500).json({ error: '获取小料选项失败' })
  }
})

// POST /api/toppings - 新增自定义小料
router.post('/', async (req, res) => {
  try {
    const { label, sort_order } = req.body
    if (!label) {
      return res.status(400).json({ error: '小料名称不能为空' })
    }
    const id = uuidv4()
    await pool.execute(
      'INSERT INTO user_toppings (id, user_id, label, sort_order, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, req.userId, label, sort_order || 0, Date.now()]
    )
    res.status(201).json({ data: { id, user_id: req.userId, label, sort_order: sort_order || 0 } })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: '该小料已存在' })
    }
    console.error('Failed to create topping:', err)
    res.status(500).json({ error: '创建小料失败' })
  }
})

// DELETE /api/toppings/:id - 删除自定义小料
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM user_toppings WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '小料不存在' })
    }
    res.json({ data: { id: req.params.id } })
  } catch (err) {
    console.error('Failed to delete topping:', err)
    res.status(500).json({ error: '删除小料失败' })
  }
})

export default router
