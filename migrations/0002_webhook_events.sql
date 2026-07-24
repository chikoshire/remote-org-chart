-- Webhook event inbox (GH#27) — D1, not Supabase
CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  delivery_key TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  company_id TEXT,
  employment_id TEXT,
  received_at TEXT NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0,
  duplicate INTEGER NOT NULL DEFAULT 0,
  payload_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at
  ON webhook_events (received_at DESC);
