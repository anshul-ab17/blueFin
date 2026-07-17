use sqlx::SqlitePool;
use tokio::sync::broadcast;

use crate::txline::TxlineClient;

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub txline: TxlineClient,
    /// odds/score/settlement events fanned out to /api/stream subscribers
    pub events: broadcast::Sender<serde_json::Value>,
}
