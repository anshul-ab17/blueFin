use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use serde::Deserialize;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use crate::state::AppState;

const QUOTE_TTL: Duration = Duration::from_secs(30);

#[derive(Clone)]
pub struct Quote {
    pub outcome_id: i64,
    pub side: String,
    pub stake: f64,
    pub odds: f64,
    pub issued: Instant,
}

/// ponytail: in-memory quote book — single binary, quotes live 30s; DB if we ever scale out
pub static QUOTES: Mutex<Option<HashMap<String, Quote>>> = Mutex::new(None);

fn now_ts() -> i64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64
}

fn quote_id() -> String {
    // 128 random bits, hex — no uuid dep needed
    let mut b = [0u8; 16];
    getrandom::getrandom(&mut b).expect("os rng");
    b.iter().map(|x| format!("{x:02x}")).collect()
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuoteReq {
    pub outcome_id: i64,
    pub side: String, // YES | NO
    pub stake: f64,
}

pub async fn post_quote(
    State(state): State<AppState>,
    Json(req): Json<QuoteReq>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if req.side != "YES" && req.side != "NO" {
        return Err(bad("side must be YES or NO"));
    }
    if !(req.stake > 0.0) {
        return Err(bad("stake must be positive"));
    }
    let row: Option<(f64, f64, String, Option<String>)> = sqlx::query_as(
        "SELECT o.yes_odds, o.no_odds, m.status, o.result
         FROM outcomes o JOIN markets m ON m.id = o.market_id WHERE o.id = ?",
    )
    .bind(req.outcome_id)
    .fetch_optional(&state.db)
    .await
    .map_err(internal)?;
    let Some((yes, no, status, result)) = row else {
        return Err((StatusCode::NOT_FOUND, Json(json!({ "error": "outcome not found" }))));
    };
    if result.is_some() || status == "settled" || status == "pending_settlement" {
        return Err(bad("market closed"));
    }
    let odds = if req.side == "YES" { yes } else { no };
    let id = quote_id();
    QUOTES
        .lock()
        .unwrap()
        .get_or_insert_with(HashMap::new)
        .insert(id.clone(), Quote {
            outcome_id: req.outcome_id,
            side: req.side.clone(),
            stake: req.stake,
            odds,
            issued: Instant::now(),
        });
    Ok(Json(json!({
        "quoteId": id,
        "outcomeId": req.outcome_id,
        "side": req.side,
        "stake": req.stake,
        "odds": odds,
        "payout": (req.stake * odds * 100.0).round() / 100.0,
        "expiresInSec": QUOTE_TTL.as_secs(),
    })))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradeReq {
    pub quote_id: String,
    pub wallet: String,
    #[serde(default)]
    pub tx_sig: Option<String>,
}

/// Validate wallet is a plausible base58-encoded Solana pubkey (32 bytes → 43-44 chars).
/// Does NOT prove the caller controls the key — on-chain tx_sig verification is the
/// proper fix; this guards against garbage / injection in the wallet column.
fn validate_wallet(w: &str) -> bool {
    const BASE58: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let w = w.trim();
    (32..=44).contains(&w.len()) && w.bytes().all(|b| BASE58.contains(&b))
}

pub async fn post_trade(
    State(state): State<AppState>,
    Json(req): Json<TradeReq>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if !validate_wallet(&req.wallet) {
        return Err(bad("wallet must be a valid Solana base58 pubkey (32–44 chars)"));
    }
    let quote = QUOTES
        .lock()
        .unwrap()
        .get_or_insert_with(HashMap::new)
        .remove(&req.quote_id);
    let Some(q) = quote else { return Err(bad("unknown quote")) };
    if q.issued.elapsed() > QUOTE_TTL {
        return Err(bad("quote expired"));
    }
    let res = sqlx::query(
        "INSERT INTO trades (wallet, outcome_id, side, stake, odds, tx_sig, created_ts) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&req.wallet)
    .bind(q.outcome_id)
    .bind(&q.side)
    .bind(q.stake)
    .bind(q.odds)
    .bind(&req.tx_sig)
    .bind(now_ts())
    .execute(&state.db)
    .await
    .map_err(internal)?;
    let market_id: Option<String> =
        sqlx::query_scalar("SELECT market_id FROM outcomes WHERE id = ?")
            .bind(q.outcome_id)
            .fetch_optional(&state.db)
            .await
            .map_err(internal)?;
    if let Some(mid) = &market_id {
        let _ = state.events.send(json!({ "type": "trade", "marketId": mid }));
    }
    Ok(Json(json!({
        "id": res.last_insert_rowid(),
        "wallet": req.wallet,
        "outcomeId": q.outcome_id,
        "side": q.side,
        "stake": q.stake,
        "odds": q.odds,
        "payout": (q.stake * q.odds * 100.0).round() / 100.0,
        "status": "open",
    })))
}

pub async fn positions(
    State(state): State<AppState>,
    Path(wallet): Path<String>,
) -> Result<Json<Value>, StatusCode> {
    let rows: Vec<(i64, String, String, String, String, f64, f64, String)> = sqlx::query_as(
        "SELECT t.id, m.team_a || ' vs ' || m.team_b, o.category, o.label, t.side, t.stake, t.odds, t.status
         FROM trades t
         JOIN outcomes o ON o.id = t.outcome_id
         JOIN markets m ON m.id = o.market_id
         WHERE t.wallet = ? ORDER BY t.created_ts DESC",
    )
    .bind(&wallet)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!(?e, "positions");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let out: Vec<Value> = rows
        .into_iter()
        .map(|(id, event, category, outcome, side, stake, odds, status)| {
            json!({
                "id": id,
                "event": event,
                "category": category,
                "outcome": outcome,
                "side": side,
                "stake": stake,
                "odds": odds,
                "payout": (stake * odds * 100.0).round() / 100.0,
                "status": status,
            })
        })
        .collect();
    Ok(Json(Value::Array(out)))
}

fn bad(msg: &str) -> (StatusCode, Json<Value>) {
    (StatusCode::BAD_REQUEST, Json(json!({ "error": msg })))
}

fn internal<E: std::fmt::Debug>(e: E) -> (StatusCode, Json<Value>) {
    tracing::error!(?e, "trades error");
    (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "internal" })))
}
