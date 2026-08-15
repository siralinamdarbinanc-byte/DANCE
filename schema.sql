-- Cloudflare D1 Database Schema for Wedding Dance Academy
-- Run using: npx wrangler d1 execute dance_academy_db --file=./schema.sql

-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  couple_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  dance_style TEXT,
  wedding_date TEXT,
  preferred_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'New',
  branch TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CRM Customers Table
CREATE TABLE IF NOT EXISTS crm_customers (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  couple_name TEXT NOT NULL,
  dance_style TEXT,
  wedding_date TEXT,
  status TEXT DEFAULT 'New',
  total_bookings INTEGER DEFAULT 1,
  internal_notes TEXT,
  tags TEXT, -- JSON array string e.g. ["تانگو", "عجله‌ای"]
  is_archived INTEGER DEFAULT 0, -- 0 = Active, 1 = Archived
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CRM Migration for existing D1 database instances:
-- ALTER TABLE crm_customers ADD COLUMN is_archived INTEGER DEFAULT 0;

-- 3. CRM Customer Interactions Timeline
CREATE TABLE IF NOT EXISTS crm_interactions (
  id TEXT PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  type TEXT NOT NULL, -- 'call', 'note', 'meeting', 'status_change', 'music_choice'
  note TEXT NOT NULL,
  author TEXT DEFAULT 'مدیریت',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_phone) REFERENCES crm_customers(phone) ON DELETE CASCADE
);

-- 4. Content Store Table (CMS Json Sync)
CREATE TABLE IF NOT EXISTS content_store (
  id TEXT PRIMARY KEY DEFAULT 'central_cms_v1',
  json_data TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Media Assets Table (Cloudflare R2 Meta)
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'audio', 'video'
  mime_type TEXT,
  url TEXT NOT NULL,
  size_bytes INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Admin User (Default Password: "admin")
INSERT OR IGNORE INTO admin_users (id, username, password_hash)
VALUES ('admin-1', 'admin', '$2a$10$wT8Kz1fGZ8Xy8Z1fG8Xy8eXy8eXy8eXy8eXy8eXy8eXy8eXy8eXy8e');
