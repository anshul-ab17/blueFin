-- final score event sequence (needed for TxLINE stat-validation proof fetch)
ALTER TABLE markets ADD COLUMN final_seq INTEGER;
