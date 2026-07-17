// Settlement worker: polls pending_settlement markets every 15s,
// fetches TxLINE stat-validation proof, shells out to bun settle.ts,
// resolves outcomes + trades, marks market settled.

use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::state::AppState;

const POLL_SECS: u64 = 15;

// SIDE_YES=0, SIDE_NO=1 (mirrors Anchor constants)
fn winning_side_for_result(score_a: i64, score_b: i64) -> u8 {
    // team_a (stored as home/YES side) wins = 0, otherwise = 1
    if score_a > score_b { 0 } else { 1 }
}

fn resolve_result(label: &str, score_a: i64, score_b: i64, team_a: &str, team_b: &str) -> &'static str {
    if label == "Draw" {
        if score_a == score_b { "YES" } else { "NO" }
    } else if label == team_a {
        if score_a > score_b { "YES" } else { "NO" }
    } else if label == team_b {
        if score_b > score_a { "YES" } else { "NO" }
    } else {
        "NO"
    }
}

fn resolve_totalgoals(label: &str, score_a: i64, score_b: i64) -> &'static str {
    let total = score_a + score_b;
    match label {
        "Over 2.5" => if total > 2 { "YES" } else { "NO" },
        "Under 2.5" => if total < 3 { "YES" } else { "NO" },
        _ => "NO",
    }
}

fn now_ts() -> i64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64
}

async fn settle_one(state: &AppState, market_id: &str) -> anyhow::Result<()> {
    // idempotent: skip if already in settlements table
    let exists: bool =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM settlements WHERE market_id = ?)")
            .bind(market_id)
            .fetch_one(&state.db)
            .await?;
    if exists {
        return Ok(());
    }

    let row: (i64, String, String, Option<i64>, Option<i64>, Option<i32>) = sqlx::query_as(
        "SELECT fixture_id, team_a, team_b, score_a, score_b, final_seq FROM markets WHERE id = ?",
    )
    .bind(market_id)
    .fetch_one(&state.db)
    .await?;
    let (fixture_id, team_a, team_b, score_a, score_b, final_seq) = row;

    let (score_a, score_b) = match (score_a, score_b) {
        (Some(a), Some(b)) => (a, b),
        _ => {
            tracing::warn!(%market_id, "pending_settlement but scores missing — skip");
            return Ok(());
        }
    };
    let seq = match final_seq {
        Some(s) => s,
        None => {
            tracing::warn!(%market_id, "no final_seq — skip");
            return Ok(());
        }
    };

    // Fetch stat-validation proof (stat_keys 1,2 = home goals, away goals)
    let proof = match state.txline.stat_validation(fixture_id, seq, "1,2").await {
        Ok(p) => p,
        Err(e) => {
            tracing::warn!(?e, %market_id, "stat_validation failed — skip");
            return Ok(());
        }
    };

    let merkle_root = proof["merkleRoot"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("proof missing merkleRoot"))?
        .to_string();
    if merkle_root.len() != 64 {
        anyhow::bail!("merkle root not 64 hex chars: {merkle_root}");
    }

    let side = winning_side_for_result(score_a, score_b);

    // Shell out: bun scripts/settle.ts <market-id> <side> <merkle-root>
    let scripts_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("scripts");
    let settle_script = scripts_dir.join("settle.ts");
    let out = Command::new("bun")
        .args([
            settle_script.to_str().unwrap(),
            market_id,
            &side.to_string(),
            &merkle_root,
        ])
        .current_dir(env!("CARGO_MANIFEST_DIR"))
        .output();

    let tx_sig: Option<String> = match out {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            serde_json::from_str::<serde_json::Value>(stdout.trim())
                .ok()
                .and_then(|v| v["sig"].as_str().map(String::from))
        }
        Ok(o) => {
            tracing::warn!(
                %market_id,
                stderr = %String::from_utf8_lossy(&o.stderr),
                "settle.ts failed (market may not exist on-chain)"
            );
            None
        }
        Err(e) => {
            tracing::warn!(?e, %market_id, "bun not found — recording DB-only settlement");
            None
        }
    };

    let ts = now_ts();

    // INSERT OR IGNORE: double-call guard
    sqlx::query(
        "INSERT OR IGNORE INTO settlements (market_id, merkle_root, tx_sig, settled_ts) VALUES (?, ?, ?, ?)",
    )
    .bind(market_id)
    .bind(&merkle_root)
    .bind(tx_sig.as_deref())
    .bind(ts)
    .execute(&state.db)
    .await?;

    sqlx::query(
        "INSERT INTO proofs (market_id, stat_key, root, proof_json, fetched_ts) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(market_id)
    .bind("1,2")
    .bind(&merkle_root)
    .bind(proof.to_string())
    .bind(ts)
    .execute(&state.db)
    .await?;

    // Resolve each outcome
    let outcomes: Vec<(i64, String, String)> = sqlx::query_as(
        "SELECT id, category, label FROM outcomes WHERE market_id = ? AND result IS NULL",
    )
    .bind(market_id)
    .fetch_all(&state.db)
    .await?;

    for (oid, category, label) in &outcomes {
        let result = match category.as_str() {
            "result" => resolve_result(label, score_a, score_b, &team_a, &team_b),
            "totalgoals" => resolve_totalgoals(label, score_a, score_b),
            _ => "NO",
        };
        sqlx::query("UPDATE outcomes SET result = ? WHERE id = ?")
            .bind(result)
            .bind(oid)
            .execute(&state.db)
            .await?;
        // side='YES' on a YES-result outcome → won; else → lost
        sqlx::query(
            "UPDATE trades SET status = CASE WHEN side = ? THEN 'won' ELSE 'lost' END WHERE outcome_id = ?",
        )
        .bind(result)
        .bind(oid)
        .execute(&state.db)
        .await?;
    }

    sqlx::query("UPDATE markets SET status = 'settled' WHERE id = ?")
        .bind(market_id)
        .execute(&state.db)
        .await?;

    let _ = state
        .events
        .send(serde_json::json!({ "type": "settlement", "marketId": market_id }));

    tracing::info!(%market_id, ?tx_sig, score_a, score_b, "market settled");
    Ok(())
}

pub fn spawn(state: AppState) {
    tokio::spawn(async move {
        let interval = tokio::time::Duration::from_secs(POLL_SECS);
        loop {
            tokio::time::sleep(interval).await;
            let ids: Vec<String> = match sqlx::query_scalar(
                "SELECT id FROM markets WHERE status = 'pending_settlement'
                 AND id NOT IN (SELECT market_id FROM settlements)",
            )
            .fetch_all(&state.db)
            .await
            {
                Ok(v) => v,
                Err(e) => {
                    tracing::error!(?e, "settlement poll query failed");
                    continue;
                }
            };
            for id in ids {
                if let Err(e) = settle_one(&state, &id).await {
                    tracing::error!(?e, %id, "settle_one error");
                }
            }
        }
    });
}
