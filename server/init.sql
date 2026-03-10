CREATE DATABASE IF NOT EXISTS naicha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE naicha;

CREATE TABLE IF NOT EXISTS records (
  id          VARCHAR(36) PRIMARY KEY,
  date        DATE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  price       DECIMAL(8,2) NOT NULL,
  shop        VARCHAR(100) NOT NULL DEFAULT '',
  sweetness   VARCHAR(10) NOT NULL,
  temperature VARCHAR(10) NOT NULL,
  toppings    JSON NOT NULL,
  rating      TINYINT NOT NULL DEFAULT 3,
  notes       TEXT NOT NULL,
  photo       LONGTEXT,
  created_at  BIGINT NOT NULL,
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
