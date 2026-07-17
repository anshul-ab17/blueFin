use futures_util::StreamExt;
use serde_json::json;
use std::time::Duration;

use crate::markets;
use crate::state::AppState;
use crate::txline::types::{OddsPayload, Scores};

const WORLD_CUP: i32 = 72;

/// Fixtures + latest odds + scores snapshots — run at boot and after every stream drop.
pub async fn resync(state: &AppState) -> anyhow::Result<()> {
    let fixtures = state.txline.fixtures_snapshot(WORLD_CUP).await?;
    tracing::info!(count = fixtures.len(), "txline fixtures");
    for f in &fixtures {
        // GameState 6 = cancelled
        if f.game_state == Some(6) {
            continue;
        }
        let id = markets::upsert_fixture(&state.db, f).await?;
        if let Ok(odds) = state.txline.odds_snapshot(f.fixture_id).await {
            for o in &odds {
                markets::apply_odds(&state.db, o).await?;
            }
        }
        if let Ok(scores) = state.txline.scores_snapshot(f.fixture_id).await {
            for s in &scores {
                markets::apply_scores(&state.db, s).await?;
            }
        }
        tracing::debug!(market = %id, "synced");
    }
    Ok(())
}

/// One SSE event: optional id/event name + concatenated data lines.
fn parse_event(raw: &str) -> (Option<String>, Option<String>, String) {
    let (mut id, mut event, mut data) = (None, None, String::new());
    for line in raw.lines() {
        if let Some(v) = line.strip_prefix("id:") {
            id = Some(v.trim().to_string());
        } else if let Some(v) = line.strip_prefix("event:") {
            event = Some(v.trim().to_string());
        } else if let Some(v) = line.strip_prefix("data:") {
            if !data.is_empty() {
                data.push('\n');
            }
            data.push_str(v.trim());
        }
    }
    (id, event, data)
}

async fn consume<F, Fut>(state: AppState, path: &'static str, mut handle: F)
where
    F: FnMut(AppState, String) -> Fut,
    Fut: std::future::Future<Output = ()>,
{
    let mut last_id: Option<String> = None;
    let mut backoff = 1u64;
    loop {
        match state.txline.open_stream(path, last_id.as_deref()).await {
            Ok(res) => {
                tracing::info!(path, "sse connected");
                backoff = 1;
                let mut buf = String::new();
                let mut stream = res.bytes_stream();
                while let Some(chunk) = stream.next().await {
                    let Ok(chunk) = chunk else { break };
                    buf.push_str(&String::from_utf8_lossy(&chunk));
                    while let Some(pos) = buf.find("\n\n") {
                        let raw = buf[..pos].to_string();
                        buf.drain(..pos + 2);
                        let (id, event, data) = parse_event(&raw);
                        if id.is_some() {
                            last_id = id;
                        }
                        if event.as_deref() == Some("heartbeat") || data.is_empty() {
                            continue;
                        }
                        handle(state.clone(), data).await;
                    }
                }
                tracing::warn!(path, "sse dropped");
            }
            Err(e) => tracing::warn!(path, ?e, "sse connect failed"),
        }
        tokio::time::sleep(Duration::from_secs(backoff)).await;
        backoff = (backoff * 2).min(60);
        if let Err(e) = resync(&state).await {
            tracing::warn!(?e, "resync failed");
        }
    }
}

pub fn spawn(state: AppState) {
    let s = state.clone();
    tokio::spawn(async move {
        consume(s, "/api/odds/stream", |state, data| async move {
            match serde_json::from_str::<OddsPayload>(&data) {
                Ok(o) => match markets::apply_odds(&state.db, &o).await {
                    Ok(Some(id)) => {
                        let _ = state.events.send(json!({ "type": "odds", "marketId": id }));
                    }
                    Ok(None) => {}
                    Err(e) => tracing::warn!(?e, "apply_odds"),
                },
                Err(e) => tracing::debug!(?e, "odds parse"),
            }
        })
        .await;
    });

    tokio::spawn(async move {
        consume(state, "/api/scores/stream", |state, data| async move {
            match serde_json::from_str::<Scores>(&data) {
                Ok(s) => match markets::apply_scores(&state.db, &s).await {
                    Ok(Some(id)) => {
                        let _ = state.events.send(json!({
                            "type": "score",
                            "marketId": id,
                            "final": s.is_final(),
                            "fixtureId": s.fixture_id,
                            "seq": s.seq,
                        }));
                    }
                    Ok(None) => {}
                    Err(e) => tracing::warn!(?e, "apply_scores"),
                },
                Err(e) => tracing::debug!(?e, "scores parse"),
            }
        })
        .await;
    });
}
