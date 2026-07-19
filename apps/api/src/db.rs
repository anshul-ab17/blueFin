use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::str::FromStr;
use std::time::Duration;

pub async fn connect(database_url: &str) -> anyhow::Result<SqlitePool> {
    // WAL = concurrent readers never block the single writer; busy_timeout makes the
    // settlement worker and a concurrent trade INSERT queue instead of erroring SQLITE_BUSY.
    let opts = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true)
        .journal_mode(SqliteJournalMode::Wal)
        .busy_timeout(Duration::from_secs(5))
        .foreign_keys(true);
    let pool = SqlitePoolOptions::new()
        .max_connections(8)
        .connect_with(opts)
        .await?;
    sqlx::migrate!("./migrations").run(&pool).await?;
    Ok(pool)
}

#[derive(sqlx::FromRow)]
pub struct MarketRow {
    pub id: String,
    pub fixture_id: i64,
    pub team_a: String,
    pub team_b: String,
    pub code_a: String,
    pub code_b: String,
    pub status: String,
    pub kickoff_ts: i64,
    pub score_a: Option<i64>,
    pub score_b: Option<i64>,
}

#[derive(sqlx::FromRow)]
pub struct OutcomeRow {
    pub id: i64,
    pub market_id: String,
    pub category: String,
    pub label: String,
    pub yes_odds: f64,
    pub no_odds: f64,
    pub pct: f64,
}

#[derive(sqlx::FromRow)]
pub struct SettlementRow {
    pub market_id: String,
    pub merkle_root: String,
    pub tx_sig: Option<String>,
    pub settled_ts: i64,
}

pub async fn markets(pool: &SqlitePool) -> sqlx::Result<Vec<MarketRow>> {
    sqlx::query_as("SELECT id, fixture_id, team_a, team_b, code_a, code_b, status, kickoff_ts, score_a, score_b FROM markets ORDER BY kickoff_ts")
        .fetch_all(pool)
        .await
}

pub async fn market(pool: &SqlitePool, id: &str) -> sqlx::Result<Option<MarketRow>> {
    sqlx::query_as("SELECT id, fixture_id, team_a, team_b, code_a, code_b, status, kickoff_ts, score_a, score_b FROM markets WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await
}

pub async fn outcomes_for(pool: &SqlitePool, market_id: &str) -> sqlx::Result<Vec<OutcomeRow>> {
    sqlx::query_as("SELECT id, market_id, category, label, yes_odds, no_odds, pct FROM outcomes WHERE market_id = ? ORDER BY id")
        .bind(market_id)
        .fetch_all(pool)
        .await
}

pub async fn settlements(pool: &SqlitePool) -> sqlx::Result<Vec<SettlementRow>> {
    sqlx::query_as("SELECT market_id, merkle_root, tx_sig, settled_ts FROM settlements ORDER BY settled_ts DESC")
        .fetch_all(pool)
        .await
}
