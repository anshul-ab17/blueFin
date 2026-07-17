CREATE TABLE odds_history (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id TEXT    NOT NULL REFERENCES markets(id),
  category  TEXT    NOT NULL,
  label     TEXT    NOT NULL,
  pct       REAL    NOT NULL,
  ts        INTEGER NOT NULL  -- unix seconds
);

CREATE INDEX idx_odds_history_market ON odds_history(market_id, category, ts);
