import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db.js'

const router = Router()

// GET /api/sweetness - 获取用户自定义甜度
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_sweetness WHERE user_id = ? ORDER BY sort_order ASC',
      [req.userId]
    )
    res.json({ data: rows })
  } catch (err) {
    console.error('Failed to fetch sweetness:', err)
    res.status(500).json({ error: '获取甜度选项失败' })
  }
})

// POST /api/sweetness - 新增自定义甜度
router.post('/', async (req, res) => {
  try {
    const { label, sort_order } = req.body
    if (!label) {
      return res.status(400).json({ error: '甜度名称不能为空' })
    }
    const id = uuidv4()
    await pool.execute(
      'INSERT INTO user_sweetness (id, user_id, label, sort_order, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, req.userId, label, sort_order || 0, Date.now()]
    )
    res.status(201).json({ data: { id, user_id: req.userId, label, sort_order: sort_order || 0 } })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: '该甜度已存在' })
    }
    console.error('Failed to create sweetness:', err)
    res.status(500).json({ error: '创建甜度失败' })
  }
})

// DELETE /api/sweetness/:id - 删除自定义甜度
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM user_sweetness WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '甜度不存在' })
    }
    res.json({ data: { id: req.params.id } })
  } catch (err) {
    console.error('Failed to delete sweetness:', err)
    res.status(500).json({ error: '删除甜度失败' })
  }
})

export default router
