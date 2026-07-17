use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::sse::{Event, Sse};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde_json::{json, Value};
use std::convert::Infallible;

use crate::db::{self, MarketRow, OutcomeRow};
use crate::state::AppState;

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/api/markets", get(list_markets))
        .route("/api/markets/{id}", get(get_market))
        .route("/api/markets/{id}/history", get(market_history))
        .route("/api/leaderboard", get(leaderboard))
        .route("/api/proofs", get(proofs))
        .route("/api/settlements", get(settlements))
        .route("/api/quotes", post(crate::trades::post_quote))
        .route("/api/trades", post(crate::trades::post_trade))
        .route("/api/positions/{wallet}", get(crate::trades::positions))
        .route("/api/stream", get(stream))
        .layer(tower_http::cors::CorsLayer::permissive())
        .with_state(state)
}

async fn health() -> &'static str {
    "ok"
}

fn category_label(id: &str) -> &'static str {
    match id {
        "result" => "Match Result",
        "totalgoals" => "Total Goals",
        "nextgoal" => "Next Goal",
        "scorer" => "First Scorer",
        _ => "Market",
    }
}

fn category_question(id: &str, m: &MarketRow) -> String {
    match id {
        "result" => format!("Full-time result: {} vs {}", m.team_a, m.team_b),
        "totalgoals" => format!("Total Goals: {} vs {} over/under 2.5", m.code_a, m.code_b),
        "nextgoal" => "Who scores next?".into(),
        "scorer" => "Who scores first?".into(),
        _ => format!("{} vs {}", m.team_a, m.team_b),
    }
}

fn date_label(kickoff_ts: i64) -> String {
    // seconds since epoch → "July 25, 2026" (UTC), no chrono dep
    let days = kickoff_ts / 86_400;
    let (y, m, d) = civil_from_days(days);
    const MONTHS: [&str; 12] = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    format!("{} {}, {}", MONTHS[(m - 1) as usize], d, y)
}

// Howard Hinnant's civil_from_days algorithm
fn civil_from_days(z: i64) -> (i64, i64, i64) {
    let z = z + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    (if m <= 2 { y + 1 } else { y }, m, d)
}

/// team colors keyed by FIFA code; fallback ocean blue
fn team_color(code: &str) -> &'static str {
    match code {
        "ARG" => "#3f7dbf",
        "FRA" => "#1565c0",
        "BRA" => "#1c8a3c",
        "GER" => "#2b2b2b",
        "ENG" => "#8c2332",
        "POR" => "#a01e28",
        "ESP" => "#c8102e",
        "NED" => "#f36c21",
        "ITA" => "#0064aa",
        "USA" => "#1f2f6b",
        "MEX" => "#006847",
        "CAN" => "#d52b1e",
        _ => "#2f6fa8",
    }
}

fn fmt_vol(v: f64) -> String {
    if v >= 1_000_000.0 {
        format!("${:.2}M", v / 1_000_000.0)
    } else if v >= 1_000.0 {
        format!("${:.0}K", v / 1_000.0)
    } else {
        format!("${:.0}", v)
    }
}

async fn category_vol(state: &AppState, market_id: &str, category: &str) -> f64 {
    sqlx::query_scalar::<_, Option<f64>>(
        "SELECT SUM(t.stake) FROM trades t JOIN outcomes o ON o.id = t.outcome_id WHERE o.market_id = ? AND o.category = ?",
    )
    .bind(market_id)
    .bind(category)
    .fetch_one(&state.db)
    .await
    .ok()
    .flatten()
    .unwrap_or(0.0)
}

async fn event_json(state: &AppState, m: &MarketRow, outcomes: Vec<OutcomeRow>) -> Value {
    // group outcomes by category, preserving insertion order
    let mut order: Vec<String> = Vec::new();
    for o in &outcomes {
        if !order.contains(&o.category) {
            order.push(o.category.clone());
        }
    }
    let mut categories = Vec::new();
    for cat in &order {
        let outs: Vec<Value> = outcomes
            .iter()
            .filter(|o| &o.category == cat)
            .map(|o| {
                json!({
                    "label": o.label,
                    "pct": o.pct,
                    "yesOdds": o.yes_odds,
                    "noOdds": o.no_odds,
                })
            })
            .collect();
        categories.push(json!({
            "id": cat,
            "label": category_label(cat),
            "question": category_question(cat, m),
            "vol": fmt_vol(category_vol(state, &m.id, cat).await),
            "outcomes": outs,
        }));
    }

    let status = if m.status == "live" { "live" } else { "upcoming" };
    let mut ev = json!({
        "id": m.id,
        "teamA": m.team_a,
        "teamB": m.team_b,
        "codeA": m.code_a,
        "colorA": team_color(&m.code_a),
        "codeB": m.code_b,
        "colorB": team_color(&m.code_b),
        "status": status,
        "dateLabel": date_label(m.kickoff_ts),
        "categories": categories,
    });
    if let (Some(a), Some(b)) = (m.score_a, m.score_b) {
        ev["score"] = json!({ "a": a, "b": b });
    }
    ev
}

async fn list_markets(State(state): State<AppState>) -> Result<Json<Value>, StatusCode> {
    let rows = db::markets(&state.db).await.map_err(internal)?;
    let mut out = Vec::new();
    for m in &rows {
        let outcomes = db::outcomes_for(&state.db, &m.id).await.map_err(internal)?;
        out.push(event_json(&state, m, outcomes).await);
    }
    Ok(Json(Value::Array(out)))
}

async fn get_market(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Value>, impl IntoResponse> {
    let m = db::market(&state.db, &id).await.map_err(|_| internal_resp())?;
    let Some(m) = m else {
        return Err((StatusCode::NOT_FOUND, Json(json!({ "error": "market not found" }))));
    };
    let outcomes = db::outcomes_for(&state.db, &m.id).await.map_err(|_| internal_resp())?;
    Ok(Json(event_json(&state, &m, outcomes).await))
}

/// GET /api/markets/{id}/history?category=result&window=1d
/// Returns probability history for charting. window: 1d|1w|1m|all (default all)
async fn market_history(
    State(state): State<AppState>,
    Path(id): Path<String>,
    axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<Json<Value>, StatusCode> {
    let category = params.get("category").cloned().unwrap_or_else(|| "result".into());
    let window_secs: i64 = match params.get("window").map(|s| s.as_str()) {
        Some("1d") => 86_400,
        Some("1w") => 7 * 86_400,
        Some("1m") => 30 * 86_400,
        _ => i64::MAX,
    };
    let since = if window_secs == i64::MAX {
        0i64
    } else {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64
            - window_secs
    };

    let rows: Vec<(String, f64, i64)> = sqlx::query_as(
        "SELECT label, pct, ts FROM odds_history
         WHERE market_id = ? AND category = ? AND ts >= ?
         ORDER BY ts ASC",
    )
    .bind(&id).bind(&category).bind(since)
    .fetch_all(&state.db)
    .await
    .map_err(internal)?;

    // group by label preserving insertion order
    let mut labels: Vec<String> = Vec::new();
    for (label, _, _) in &rows {
        if !labels.contains(label) { labels.push(label.clone()); }
    }

    // build series: [{ts, values:[pct per label]}]
    // collect all unique timestamps
    let mut ts_set: Vec<i64> = rows.iter().map(|(_, _, ts)| *ts).collect();
    ts_set.dedup();

    let series: Vec<Value> = ts_set.into_iter().map(|ts| {
        let values: Vec<Value> = labels.iter().map(|l| {
            rows.iter()
                .filter(|(rl, _, rts)| rl == l && *rts <= ts)
                .last()
                .map(|(_, pct, _)| json!(pct))
                .unwrap_or(Value::Null)
        }).collect();
        json!({ "ts": ts, "values": values })
    }).collect();

    Ok(Json(json!({
        "marketId": id,
        "category": category,
        "labels": labels,
        "series": series,
    })))
}

async fn leaderboard(State(state): State<AppState>) -> Result<Json<Value>, StatusCode> {
    let rows: Vec<(String, f64)> = sqlx::query_as(
        "SELECT wallet, SUM(stake) AS vol FROM trades GROUP BY wallet ORDER BY vol DESC LIMIT 10",
    )
    .fetch_all(&state.db)
    .await
    .map_err(internal)?;
    let out: Vec<Value> = rows
        .iter()
        .enumerate()
        .map(|(i, (wallet, vol))| {
            let name = if wallet.len() > 8 {
                format!("{}…{}", &wallet[..4], &wallet[wallet.len() - 4..])
            } else {
                wallet.clone()
            };
            json!({ "rank": i + 1, "name": name, "volume": fmt_vol(*vol), "change": "+0.0%" })
        })
        .collect();
    Ok(Json(Value::Array(out)))
}

async fn proofs(State(state): State<AppState>) -> Result<Json<Value>, StatusCode> {
    let rows: Vec<(i64, String, String, String, i64)> = sqlx::query_as(
        "SELECT p.id, p.market_id, p.stat_key, p.root, p.fetched_ts FROM proofs p ORDER BY p.fetched_ts DESC",
    )
    .fetch_all(&state.db)
    .await
    .map_err(internal)?;
    let mut out = Vec::new();
    for (id, market_id, stat_key, root, ts) in rows {
        let m = db::market(&state.db, &market_id).await.map_err(internal)?;
        let (event, _) = m
            .map(|m| (format!("{} vs {}", m.team_a, m.team_b), m.status))
            .unwrap_or((market_id.clone(), String::new()));
        let sig: Option<String> = sqlx::query_scalar("SELECT tx_sig FROM settlements WHERE market_id = ?")
            .bind(&market_id)
            .fetch_optional(&state.db)
            .await
            .map_err(internal)?
            .flatten();
        out.push(json!({
            "id": id,
            "event": event,
            "market": stat_key,
            "outcome": "",
            "root": root,
            "sig": sig.unwrap_or_default(),
            "time": date_label(ts),
        }));
    }
    Ok(Json(Value::Array(out)))
}

async fn settlements(State(state): State<AppState>) -> Result<Json<Value>, StatusCode> {
    let rows = db::settlements(&state.db).await.map_err(internal)?;
    let mut out = Vec::new();
    for s in rows {
        let m = db::market(&state.db, &s.market_id).await.map_err(internal)?;
        let event = m
            .map(|m| format!("{} vs {}", m.team_a, m.team_b))
            .unwrap_or_else(|| s.market_id.clone());
        let outcome: Option<String> = sqlx::query_scalar(
            "SELECT category || ': ' || label FROM outcomes WHERE market_id = ? AND result = 'YES' LIMIT 1",
        )
        .bind(&s.market_id)
        .fetch_optional(&state.db)
        .await
        .map_err(internal)?;
        out.push(json!({
            "event": event,
            "outcome": outcome.unwrap_or_default(),
            "time": date_label(s.settled_ts),
        }));
    }
    Ok(Json(Value::Array(out)))
}

async fn stream(State(state): State<AppState>) -> Sse<impl futures_util::Stream<Item = Result<Event, Infallible>>> {
    let rx = state.events.subscribe();
    let s = futures_util::stream::unfold(rx, |mut rx| async move {
        loop {
            match rx.recv().await {
                Ok(msg) => {
                    return Some((Ok(Event::default().data(msg.to_string())), rx));
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => continue,
                Err(_) => return None,
            }
        }
    });
    Sse::new(s).keep_alive(axum::response::sse::KeepAlive::new())
}

fn internal<E: std::fmt::Debug>(e: E) -> StatusCode {
    tracing::error!(?e, "db error");
    StatusCode::INTERNAL_SERVER_ERROR
}

fn internal_resp() -> (StatusCode, Json<Value>) {
    (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "internal" })))
}
