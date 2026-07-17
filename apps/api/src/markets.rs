use sqlx::SqlitePool;

use crate::txline::types::{Fixture, OddsPayload, Scores};

/// house margin applied to demargined StablePrice odds
const MARGIN: f64 = 0.05;

pub fn team_code(name: &str) -> String {
    match name {
        "Spain" => "ESP",
        "Argentina" => "ARG",
        "France" => "FRA",
        "England" => "ENG",
        "Germany" => "GER",
        "Brazil" => "BRA",
        "Portugal" => "POR",
        "Netherlands" => "NED",
        "Italy" => "ITA",
        "United States" | "USA" => "USA",
        "Mexico" => "MEX",
        "Canada" => "CAN",
        "Uruguay" => "URU",
        "Croatia" => "CRO",
        "Belgium" => "BEL",
        "Japan" => "JPN",
        "Morocco" => "MAR",
        "Switzerland" => "SUI",
        _ => return name.chars().filter(|c| c.is_alphabetic()).take(3).collect::<String>().to_uppercase(),
    }
    .to_string()
}

pub fn market_slug(f: &Fixture) -> String {
    format!(
        "{}-{}",
        team_code(&f.participant1).to_lowercase(),
        team_code(&f.participant2).to_lowercase()
    )
}

/// implied probability (0..1) -> (pct, yes_odds, no_odds) with house margin
pub fn derive_odds(p: f64) -> (f64, f64, f64) {
    let p = p.clamp(0.001, 0.999);
    let yes = (1.0 / p * (1.0 - MARGIN)).max(1.01);
    let no = (1.0 / (1.0 - p) * (1.0 - MARGIN)).max(1.01);
    (
        (p * 100.0 * 10.0).round() / 10.0,
        (yes * 100.0).round() / 100.0,
        (no * 100.0).round() / 100.0,
    )
}

pub async fn upsert_fixture(pool: &SqlitePool, f: &Fixture) -> anyhow::Result<String> {
    let id = market_slug(f);
    let (home, away) = if f.participant1_is_home {
        (&f.participant1, &f.participant2)
    } else {
        (&f.participant2, &f.participant1)
    };
    sqlx::query(
        "INSERT INTO markets (id, fixture_id, team_a, team_b, code_a, code_b, kickoff_ts)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET kickoff_ts = excluded.kickoff_ts",
    )
    .bind(&id)
    .bind(f.fixture_id)
    .bind(home)
    .bind(away)
    .bind(team_code(home))
    .bind(team_code(away))
    .bind(f.start_time / 1000)
    .execute(pool)
    .await?;
    Ok(id)
}

async fn upsert_outcome(
    pool: &SqlitePool,
    market_id: &str,
    category: &str,
    label: &str,
    p: f64,
) -> anyhow::Result<()> {
    let (pct, yes, no) = derive_odds(p);
    sqlx::query(
        "INSERT INTO outcomes (market_id, category, label, yes_odds, no_odds, pct)
         SELECT ?, ?, ?, ?, ?, ?
         WHERE NOT EXISTS (SELECT 1 FROM outcomes WHERE market_id = ? AND category = ? AND label = ?)",
    )
    .bind(market_id).bind(category).bind(label).bind(yes).bind(no).bind(pct)
    .bind(market_id).bind(category).bind(label)
    .execute(pool)
    .await?;
    sqlx::query(
        "UPDATE outcomes SET yes_odds = ?, no_odds = ?, pct = ?
         WHERE market_id = ? AND category = ? AND label = ? AND result IS NULL",
    )
    .bind(yes).bind(no).bind(pct)
    .bind(market_id).bind(category).bind(label)
    .execute(pool)
    .await?;
    Ok(())
}

fn pcts(o: &OddsPayload) -> Option<Vec<f64>> {
    let v: Vec<f64> = o.pct.iter().filter_map(|s| s.parse().ok()).collect();
    (v.len() == o.price_names.len()).then_some(v)
}

/// Apply one StablePrice odds record to the outcomes table.
/// Returns the market id when something changed.
pub async fn apply_odds(pool: &SqlitePool, o: &OddsPayload) -> anyhow::Result<Option<String>> {
    let market: Option<(String, String, String)> =
        sqlx::query_as("SELECT id, team_a, team_b FROM markets WHERE fixture_id = ?")
            .bind(o.fixture_id)
            .fetch_optional(pool)
            .await?;
    let Some((id, team_a, team_b)) = market else { return Ok(None) };

    match o.super_odds_type.as_str() {
        "1X2_PARTICIPANT_RESULT" => {
            let Some(p) = pcts(o) else { return Ok(None) };
            // PriceNames: part1, draw, part2 (part1 = Participant1, home side stored as team_a)
            for (name, p) in o.price_names.iter().zip(p) {
                let label = match name.as_str() {
                    "part1" => team_a.as_str(),
                    "part2" => team_b.as_str(),
                    "draw" => "Draw",
                    _ => continue,
                };
                upsert_outcome(pool, &id, "result", label, p / 100.0).await?;
            }
            Ok(Some(id))
        }
        t if t.starts_with("OVERUNDER") => {
            // only the classic 2.5 line, matching the UI category
            let line = o
                .market_parameters
                .as_deref()
                .and_then(|m| m.strip_prefix("line="))
                .unwrap_or("");
            if line != "2.5" {
                return Ok(None);
            }
            let Some(p) = pcts(o) else { return Ok(None) };
            for (name, p) in o.price_names.iter().zip(p) {
                let label = match name.as_str() {
                    "over" => "Over 2.5",
                    "under" => "Under 2.5",
                    _ => continue,
                };
                upsert_outcome(pool, &id, "totalgoals", label, p / 100.0).await?;
            }
            Ok(Some(id))
        }
        _ => Ok(None), // AH etc: no matching UI category
    }
}

/// Apply a scores record: live status + score, FT -> pending_settlement.
pub async fn apply_scores(pool: &SqlitePool, s: &Scores) -> anyhow::Result<Option<String>> {
    let id: Option<String> = sqlx::query_scalar("SELECT id FROM markets WHERE fixture_id = ?")
        .bind(s.fixture_id)
        .fetch_optional(pool)
        .await?;
    let Some(id) = id else { return Ok(None) };

    let status = if s.is_final() { "pending_settlement" } else { "live" };
    let final_seq = s.is_final().then_some(s.seq);
    if let Some((a, b)) = s.goals() {
        sqlx::query(
            "UPDATE markets SET status = ?, score_a = ?, score_b = ?, final_seq = COALESCE(?, final_seq)
             WHERE id = ? AND status != 'settled'",
        )
        .bind(status).bind(a).bind(b).bind(final_seq).bind(&id)
        .execute(pool)
        .await?;
    } else {
        sqlx::query(
            "UPDATE markets SET status = ?, final_seq = COALESCE(?, final_seq) WHERE id = ? AND status != 'settled'",
        )
        .bind(status).bind(final_seq).bind(&id)
        .execute(pool)
        .await?;
    }
    Ok(Some(id))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn derive_odds_applies_margin() {
        // 50%: fair 2.0 -> 1.9 both sides
        let (pct, yes, no) = derive_odds(0.5);
        assert_eq!(pct, 50.0);
        assert_eq!(yes, 1.9);
        assert_eq!(no, 1.9);
        // 42.319% (live Spain sample): yes < fair 2.363
        let (_, yes, no) = derive_odds(0.42319);
        assert!((yes - 2.24).abs() < 0.01, "yes={yes}");
        assert!((no - 1.65).abs() < 0.01, "no={no}");
        // extreme favourite still >= 1.01
        let (_, yes, _) = derive_odds(0.999);
        assert!(yes >= 1.01);
    }

    #[test]
    fn team_codes() {
        assert_eq!(team_code("Spain"), "ESP");
        assert_eq!(team_code("Argentina"), "ARG");
        assert_eq!(team_code("Atlantis"), "ATL");
    }
}
