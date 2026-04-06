-- Track per-day completions for habit tasks
CREATE TABLE IF NOT EXISTS habit_completions (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  completed_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_comp_unique ON habit_completions(item_id, completed_date);
