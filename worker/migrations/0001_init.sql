-- D1 (SQLite) schema for sensor readings
CREATE TABLE IF NOT EXISTS sensor_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,                 -- unix epoch milliseconds (from client)
  heart_rate INTEGER NOT NULL,
  temperature REAL NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_ts ON sensor_readings(ts);
