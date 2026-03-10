import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db.js'

const router = Router()

// GET /api/brands - 获取系统默认 + 用户自定义品牌
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM brands WHERE is_default = 1 OR user_id = ? ORDER BY is_default DESC, created_at ASC',
      [req.userId]
    )
    res.json({ data: rows })
  } catch (err) {
    console.error('Failed to fetch brands:', err)
    res.status(500).json({ error: '获取品牌失败' })
  }
})

// POST /api/brands - 新增自定义品牌
router.post('/', async (req, res) => {
  try {
    const { name, logo } = req.body
    if (!name) {
      return res.status(400).json({ error: '品牌名称不能为空' })
    }
    const id = uuidv4()
    await pool.execute(
      'INSERT INTO brands (id, name, logo, is_default, user_id, created_at) VALUES (?, ?, ?, 0, ?, ?)',
      [id, name, logo || null, req.userId, Date.now()]
    )
    res.status(201).json({ data: { id, name, logo, is_default: 0, user_id: req.userId } })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: '该品牌已存在' })
    }
    console.error('Failed to create brand:', err)
    res.status(500).json({ error: '创建品牌失败' })
  }
})

// PUT /api/brands/:id - 更新自定义品牌
router.put('/:id', async (req, res) => {
  try {
    const { name, logo } = req.body
    const fields = []
    const values = []
    if (name !== undefined) { fields.push('name = ?'); values.push(name) }
    if (logo !== undefined) { fields.push('logo = ?'); values.push(logo) }
    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' })
    }
    values.push(req.params.id, req.userId)
    const [result] = await pool.execute(
      `UPDATE brands SET ${fields.join(', ')} WHERE id = ? AND user_id = ? AND is_default = 0`,
      values
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '品牌不存在或无权修改' })
    }
    res.json({ data: { id: req.params.id, name, logo } })
  } catch (err) {
    console.error('Failed to update brand:', err)
    res.status(500).json({ error: '更新品牌失败' })
  }
})

// DELETE /api/brands/:id - 删除自定义品牌
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM brands WHERE id = ? AND user_id = ? AND is_default = 0',
      [req.params.id, req.userId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '品牌不存在或无权删除' })
    }
    res.json({ data: { id: req.params.id } })
  } catch (err) {
    console.error('Failed to delete brand:', err)
    res.status(500).json({ error: '删除品牌失败' })
  }
})

export default router
