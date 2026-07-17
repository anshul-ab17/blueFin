CREATE TABLE markets (
  id TEXT PRIMARY KEY,              -- e.g. 'arg-fra'
  fixture_id INTEGER NOT NULL,
  team_a TEXT NOT NULL, team_b TEXT NOT NULL,
  code_a TEXT NOT NULL, code_b TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',   -- upcoming|live|pending_settlement|settled
  kickoff_ts INTEGER NOT NULL,
  score_a INTEGER, score_b INTEGER,
  onchain_addr TEXT
);

CREATE TABLE outcomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id TEXT NOT NULL REFERENCES markets(id),
  category TEXT NOT NULL,           -- result|totalgoals|nextgoal|scorer
  label TEXT NOT NULL,
  yes_odds REAL NOT NULL, no_odds REAL NOT NULL, pct REAL NOT NULL,
  result TEXT                       -- NULL until resolved: 'YES'|'NO'
);

CREATE TABLE trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT NOT NULL,
  outcome_id INTEGER NOT NULL REFERENCES outcomes(id),
  side TEXT NOT NULL, stake REAL NOT NULL, odds REAL NOT NULL,
  tx_sig TEXT, created_ts INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'   -- open|won|lost|claimed
);

CREATE TABLE settlements (
  market_id TEXT PRIMARY KEY REFERENCES markets(id),  -- PK doubles as double-settle guard
  merkle_root TEXT NOT NULL, tx_sig TEXT, settled_ts INTEGER NOT NULL
);

CREATE TABLE proofs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id TEXT NOT NULL, stat_key TEXT NOT NULL,
  root TEXT NOT NULL, proof_json TEXT NOT NULL, fetched_ts INTEGER NOT NULL
);
