CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mappings (
  version      TEXT PRIMARY KEY,
  created_at   TEXT NOT NULL,
  is_active    INTEGER NOT NULL DEFAULT 0,
  content_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  description  TEXT,
  content_json TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id                        TEXT PRIMARY KEY,
  created_at                TEXT NOT NULL,
  created_at_jalali         TEXT NOT NULL DEFAULT '',
  request_id                TEXT NOT NULL DEFAULT '',
  mapping_version           TEXT NOT NULL,
  request_json              TEXT NOT NULL,
  response_json             TEXT,
  error_json                TEXT,
  http_status               INTEGER,
  duration_ms               INTEGER NOT NULL,
  status                    TEXT NOT NULL,
  leg_count                 INTEGER NOT NULL DEFAULT 1,
  fraud_message_id          TEXT NOT NULL DEFAULT '',
  transaction_snapshot_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
