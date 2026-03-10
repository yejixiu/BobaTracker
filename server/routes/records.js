import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/records - 获取当前用户所有记录
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, b.name as brand_name, b.logo as brand_logo
       FROM records r LEFT JOIN brands b ON r.brand_id = b.id
       WHERE r.user_id = ? ORDER BY r.created_at DESC`,
      [req.userId]
    )
    res.json({ data: rows })
  } catch (err) {
    console.error('Failed to fetch records:', err)
    res.status(500).json({ error: '获取记录失败' })
  }
})

// GET /api/records/stats/summary - 首页汇总
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.userId
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) as totalCups, COALESCE(SUM(price),0) as totalSpent,
              COUNT(DISTINCT date) as totalDays
       FROM records WHERE user_id = ?`,
      [userId]
    )
    const today = new Date().toISOString().slice(0, 10)
    const [todayRecords] = await pool.query(
      `SELECT r.*, b.name as brand_name, b.logo as brand_logo
       FROM records r LEFT JOIN brands b ON r.brand_id = b.id
       WHERE r.user_id = ? AND r.date = ? ORDER BY r.created_at DESC`,
      [userId, today]
    )
    res.json({
      data: {
        totalCups: totals.totalCups,
        totalSpent: totals.totalSpent,
        totalDays: totals.totalDays,
        todayRecords,
      }
    })
  } catch (err) {
    console.error('Failed to get summary:', err)
    res.status(500).json({ error: '获取汇总失败' })
  }
})

// GET /api/records/stats/calendar?year=&month= - 日历数据
router.get('/stats/calendar', async (req, res) => {
  try {
    const { year, month } = req.query
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`
    const [rows] = await pool.query(
      `SELECT r.date, r.rating, r.id, r.name, r.price, b.name as brand_name, b.logo as brand_logo
       FROM records r LEFT JOIN brands b ON r.brand_id = b.id
       WHERE r.user_id = ? AND r.date >= ? AND r.date <= ?
       ORDER BY r.date, r.created_at`,
      [req.userId, startDate, endDate]
    )
    res.json({ data: rows })
  } catch (err) {
    console.error('Failed to get calendar data:', err)
    res.status(500).json({ error: '获取日历数据失败' })
  }
})

// GET /api/records/stats/brands - 按品牌统计
router.get('/stats/brands', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.name, b.logo, COUNT(*) as count,
              SUM(r.price) as totalSpent, AVG(r.rating) as avgRating
       FROM records r JOIN brands b ON r.brand_id = b.id
       WHERE r.user_id = ? AND r.brand_id IS NOT NULL
       GROUP BY b.id, b.name, b.logo
       ORDER BY count DESC`,
      [req.userId]
    )
    res.json({ data: rows })
  } catch (err) {
    console.error('Failed to get brand stats:', err)
    res.status(500).json({ error: '获取品牌统计失败' })
  }
})

// GET /api/records/stats/period?start=&end= - 自定义时间段统计
router.get('/stats/period', async (req, res) => {
  try {
    const { start, end } = req.query
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) as totalCups, COALESCE(SUM(price),0) as totalSpent,
              COUNT(DISTINCT date) as totalDays
       FROM records WHERE user_id = ? AND date >= ? AND date <= ?`,
      [req.userId, start, end]
    )
    // By brand
    const [byBrand] = await pool.query(
      `SELECT b.id, b.name, b.logo, COUNT(*) as count, SUM(r.price) as totalSpent
       FROM records r JOIN brands b ON r.brand_id = b.id
       WHERE r.user_id = ? AND r.date >= ? AND r.date <= ? AND r.brand_id IS NOT NULL
       GROUP BY b.id, b.name, b.logo ORDER BY count DESC`,
      [req.userId, start, end]
    )
    // By drink name
    const [byName] = await pool.query(
      `SELECT name, COUNT(*) as count, SUM(price) as totalSpent
       FROM records WHERE user_id = ? AND date >= ? AND date <= ?
       GROUP BY name ORDER BY count DESC LIMIT 20`,
      [req.userId, start, end]
    )
    // By sweetness
    const [bySweetness] = await pool.query(
      `SELECT sweetness, COUNT(*) as count
       FROM records WHERE user_id = ? AND date >= ? AND date <= ? AND sweetness != ''
       GROUP BY sweetness ORDER BY count DESC`,
      [req.userId, start, end]
    )
    res.json({
      data: { ...totals, byBrand, byName, bySweetness }
    })
  } catch (err) {
    console.error('Failed to get period stats:', err)
    res.status(500).json({ error: '获取统计失败' })
  }
})

// GET /api/records/:id - 获取单条记录
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, b.name as brand_name, b.logo as brand_logo
       FROM records r LEFT JOIN brands b ON r.brand_id = b.id
       WHERE r.id = ? AND r.user_id = ?`,
      [req.params.id, req.userId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: '记录不存在' })
    }
    res.json({ data: rows[0] })
  } catch (err) {
    console.error('Failed to fetch record:', err)
    res.status(500).json({ error: '获取记录失败' })
  }
})

// POST /api/records - 创建记录
router.post('/', async (req, res) => {
  try {
    const r = req.body
    const sql = `INSERT INTO records (id, user_id, date, name, price, shop, brand_id, sweetness, temperature, toppings, rating, notes, photo, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    await pool.execute(sql, [
      r.id, req.userId, r.date, r.name, r.price, r.shop || '',
      r.brandId || null, r.sweetness || '', r.temperature || '',
      JSON.stringify(r.toppings || []),
      r.rating || 0, r.notes || '', r.photo || null, r.createdAt,
    ])
    res.status(201).json({ data: r })
  } catch (err) {
    console.error('Failed to create record:', err)
    res.status(500).json({ error: '创建记录失败' })
  }
})

// PUT /api/records/:id - 更新记录
router.put('/:id', async (req, res) => {
  try {
    const r = req.body
    const fields = []
    const values = []

    if (r.date !== undefined) { fields.push('date = ?'); values.push(r.date) }
    if (r.name !== undefined) { fields.push('name = ?'); values.push(r.name) }
    if (r.price !== undefined) { fields.push('price = ?'); values.push(r.price) }
    if (r.shop !== undefined) { fields.push('shop = ?'); values.push(r.shop) }
    if (r.brandId !== undefined) { fields.push('brand_id = ?'); values.push(r.brandId || null) }
    if (r.sweetness !== undefined) { fields.push('sweetness = ?'); values.push(r.sweetness) }
    if (r.temperature !== undefined) { fields.push('temperature = ?'); values.push(r.temperature) }
    if (r.toppings !== undefined) { fields.push('toppings = ?'); values.push(JSON.stringify(r.toppings)) }
    if (r.rating !== undefined) { fields.push('rating = ?'); values.push(r.rating) }
    if (r.notes !== undefined) { fields.push('notes = ?'); values.push(r.notes) }
    if (r.photo !== undefined) { fields.push('photo = ?'); values.push(r.photo || null) }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' })
    }

    values.push(req.params.id, req.userId)
    const sql = `UPDATE records SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`
    const [result] = await pool.execute(sql, values)

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '记录不存在' })
    }
    res.json({ data: { id: req.params.id, ...r } })
  } catch (err) {
    console.error('Failed to update record:', err)
    res.status(500).json({ error: '更新记录失败' })
  }
})

// DELETE /api/records/:id - 删除记录
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM records WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '记录不存在' })
    }
    res.json({ data: { id: req.params.id } })
  } catch (err) {
    console.error('Failed to delete record:', err)
    res.status(500).json({ error: '删除记录失败' })
  }
})

// POST /api/records/import - 批量导入
router.post('/import', async (req, res) => {
  try {
    const records = req.body
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: '请提供记录数组' })
    }

    const sql = `INSERT IGNORE INTO records (id, user_id, date, name, price, shop, brand_id, sweetness, temperature, toppings, rating, notes, photo, created_at)
                 VALUES ?`
    const values = records.map(r => [
      r.id, req.userId, r.date, r.name, r.price, r.shop || '',
      r.brandId || null, r.sweetness || '', r.temperature || '',
      JSON.stringify(r.toppings || []),
      r.rating || 0, r.notes || '', r.photo || null, r.createdAt,
    ])
    await pool.query(sql, [values])
    res.json({ data: { imported: values.length } })
  } catch (err) {
    console.error('Failed to import records:', err)
    res.status(500).json({ error: '导入失败' })
  }
})

export default router
