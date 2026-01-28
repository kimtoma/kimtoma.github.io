-- Chat logs database schema for Cloudflare D1
-- Free tier limits: 5GB storage, 5M reads/day, 100K writes/day

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  last_active INTEGER NOT NULL,
  user_ip TEXT,
  user_agent TEXT,
  message_count INTEGER DEFAULT 0
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'ai')),
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  token_count INTEGER,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);

-- Usage tracking for free tier limits
CREATE TABLE IF NOT EXISTS daily_usage (
  date TEXT PRIMARY KEY,
  write_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_date ON daily_usage(date);
