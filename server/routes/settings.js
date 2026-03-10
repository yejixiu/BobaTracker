import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db.js'

const DEFAULT_FIELD_CONFIG = [
  { key: 'brand', label: '奶茶品牌', visible: true, required: true, order: 0 },
  { key: 'name', label: '奶茶名称', visible: true, required: true, order: 1 },
  { key: 'price', label: '奶茶金额', visible: true, required: true, order: 2 },
  { key: 'temperature', label: '奶茶温度', visible: true, required: false, order: 3 },
  { key: 'sweetness', label: '奶茶甜度', visible: true, required: false, order: 4 },
  { key: 'toppings', label: '奶茶小料', visible: true, required: false, order: 5 },
  { key: 'rating', label: '奶茶评分', visible: true, required: false, order: 6 },
  { key: 'notes', label: '奶茶评价', visible: true, required: false, order: 7 },
  { key: 'photo', label: '奶茶照片', visible: true, required: false, order: 8 },
]

const router = Router()

// GET /api/settings - 获取用户字段配置
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.userId]
    )
    if (rows.length === 0) {
      return res.json({ data: { field_config: DEFAULT_FIELD_CONFIG } })
    }
    res.json({ data: rows[0] })
  } catch (err) {
    console.error('Failed to fetch settings:', err)
    res.status(500).json({ error: '获取设置失败' })
  }
})

// PUT /api/settings - 保存用户字段配置
router.put('/', async (req, res) => {
  try {
    const { field_config } = req.body
    if (!field_config || !Array.isArray(field_config)) {
      return res.status(400).json({ error: '无效的字段配置' })
    }

    const [existing] = await pool.query(
      'SELECT id FROM user_settings WHERE user_id = ?',
      [req.userId]
    )

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE user_settings SET field_config = ?, updated_at = ? WHERE user_id = ?',
        [JSON.stringify(field_config), Date.now(), req.userId]
      )
    } else {
      const id = uuidv4()
      await pool.execute(
        'INSERT INTO user_settings (id, user_id, field_config, updated_at) VALUES (?, ?, ?, ?)',
        [id, req.userId, JSON.stringify(field_config), Date.now()]
      )
    }

    res.json({ data: { field_config } })
  } catch (err) {
    console.error('Failed to save settings:', err)
    res.status(500).json({ error: '保存设置失败' })
  }
})

export default router
