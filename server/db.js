import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'naicha',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
})

const DEFAULT_BRANDS = [
  { name: '喜茶', logo: '/brands/heytea.png' },
  { name: '古茗', logo: '/brands/guming.png' },
  { name: '一点点', logo: '/brands/yidian.png' },
  { name: '奈雪的茶', logo: '/brands/nayuki.png' },
  { name: '茶百道', logo: '/brands/chabaidao.png' },
  { name: '沪上阿姨', logo: '/brands/hushangy.png' },
  { name: '蜜雪冰城', logo: '/brands/mixue.png' },
  { name: '书亦烧仙草', logo: '/brands/shuyi.png' },
  { name: '瑞幸', logo: '/brands/luckin.png' },
  { name: '星巴克', logo: '/brands/starbucks.png' },
  { name: 'CoCo都可', logo: '/brands/coco.png' },
  { name: '益禾堂', logo: '/brands/yihetang.png' },
]

export async function initDB() {
  // Users table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          VARCHAR(36) PRIMARY KEY,
      username    VARCHAR(50) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      nickname    VARCHAR(50) NOT NULL DEFAULT '',
      avatar      LONGTEXT,
      created_at  BIGINT NOT NULL,
      INDEX idx_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // Brands table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS brands (
      id          VARCHAR(36) PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      logo        VARCHAR(500) DEFAULT NULL,
      is_default  TINYINT(1) NOT NULL DEFAULT 0,
      user_id     VARCHAR(36) DEFAULT NULL,
      created_at  BIGINT NOT NULL,
      INDEX idx_user (user_id),
      UNIQUE KEY uk_user_brand (user_id, name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // Seed default brands
  for (const b of DEFAULT_BRANDS) {
    await pool.execute(
      `INSERT IGNORE INTO brands (id, name, logo, is_default, user_id, created_at)
       VALUES (UUID(), ?, ?, 1, NULL, ?)`,
      [b.name, b.logo, Date.now()]
    )
  }

  // User sweetness
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS user_sweetness (
      id          VARCHAR(36) PRIMARY KEY,
      user_id     VARCHAR(36) NOT NULL,
      label       VARCHAR(50) NOT NULL,
      sort_order  INT NOT NULL DEFAULT 0,
      created_at  BIGINT NOT NULL,
      UNIQUE KEY uk_user_label (user_id, label),
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // User toppings
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS user_toppings (
      id          VARCHAR(36) PRIMARY KEY,
      user_id     VARCHAR(36) NOT NULL,
      label       VARCHAR(50) NOT NULL,
      sort_order  INT NOT NULL DEFAULT 0,
      created_at  BIGINT NOT NULL,
      UNIQUE KEY uk_user_label (user_id, label),
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // User settings
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id          VARCHAR(36) PRIMARY KEY,
      user_id     VARCHAR(36) NOT NULL UNIQUE,
      field_config JSON NOT NULL,
      updated_at  BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // Records table (original + new columns)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS records (
      id          VARCHAR(36) PRIMARY KEY,
      user_id     VARCHAR(36) NOT NULL DEFAULT '',
      date        DATE NOT NULL,
      name        VARCHAR(100) NOT NULL,
      price       DECIMAL(8,2) NOT NULL,
      shop        VARCHAR(100) NOT NULL DEFAULT '',
      brand_id    VARCHAR(36) DEFAULT NULL,
      sweetness   VARCHAR(50) NOT NULL DEFAULT '',
      temperature VARCHAR(10) NOT NULL DEFAULT '',
      toppings    JSON NOT NULL,
      rating      TINYINT NOT NULL DEFAULT 0,
      notes       TEXT NOT NULL,
      photo       LONGTEXT,
      created_at  BIGINT NOT NULL,
      INDEX idx_date (date),
      INDEX idx_user_date (user_id, date),
      INDEX idx_user_brand (user_id, brand_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // Migration: add columns if they don't exist (for existing databases)
  try {
    await pool.execute(`ALTER TABLE records ADD COLUMN user_id VARCHAR(36) NOT NULL DEFAULT '' AFTER id`)
  } catch (e) { /* column already exists */ }
  try {
    await pool.execute(`ALTER TABLE records ADD COLUMN brand_id VARCHAR(36) DEFAULT NULL AFTER shop`)
  } catch (e) { /* column already exists */ }
  try {
    await pool.execute(`ALTER TABLE records ADD INDEX idx_user_date (user_id, date)`)
  } catch (e) { /* index already exists */ }
  try {
    await pool.execute(`ALTER TABLE records ADD INDEX idx_user_brand (user_id, brand_id)`)
  } catch (e) { /* index already exists */ }

  // Widen sweetness column for custom values
  try {
    await pool.execute(`ALTER TABLE records MODIFY COLUMN sweetness VARCHAR(50) NOT NULL DEFAULT ''`)
  } catch (e) { /* already modified */ }

  console.log('Database initialized')
}

export default pool
