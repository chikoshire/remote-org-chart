-- Sync run log for org-chart Remote fetches (GH#26)
CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  ok INTEGER NOT NULL DEFAULT 0,
  employment_count INTEGER,
  error_summary TEXT,
  trigger TEXT NOT NULL DEFAULT 'cold'
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_started_at ON sync_runs (started_at DESC);
