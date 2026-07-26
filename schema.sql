DROP TABLE IF EXISTS scripts;
CREATE TABLE scripts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  language    TEXT NOT NULL DEFAULT 'javascript',
  description TEXT,
  code        TEXT NOT NULL,
  views       INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_scripts_language ON scripts(language);
