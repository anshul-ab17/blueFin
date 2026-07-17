pub mod ingest;
pub mod types;

use reqwest::header::{HeaderMap, HeaderValue};
use types::{Fixture, OddsPayload, Scores};

#[derive(Clone)]
pub struct TxlineClient {
    http: reqwest::Client,
    base: String,
}

impl TxlineClient {
    pub fn new(base: &str, jwt: &str, api_token: &str) -> anyhow::Result<Self> {
        let mut headers = HeaderMap::new();
        headers.insert("Authorization", HeaderValue::from_str(&format!("Bearer {jwt}"))?);
        headers.insert("X-Api-Token", HeaderValue::from_str(api_token)?);
        Ok(Self {
            http: reqwest::Client::builder().default_headers(headers).build()?,
            base: base.trim_end_matches('/').to_string(),
        })
    }

    async fn get_json<T: serde::de::DeserializeOwned>(&self, path: &str) -> anyhow::Result<T> {
        let url = format!("{}{}", self.base, path);
        let res = self.http.get(&url).send().await?;
        let status = res.status();
        if !status.is_success() {
            anyhow::bail!("txline GET {path} -> {status}: {}", res.text().await.unwrap_or_default());
        }
        Ok(res.json().await?)
    }

    pub async fn fixtures_snapshot(&self, competition_id: i32) -> anyhow::Result<Vec<Fixture>> {
        self.get_json(&format!("/api/fixtures/snapshot?competitionId={competition_id}")).await
    }

    pub async fn odds_snapshot(&self, fixture_id: i64) -> anyhow::Result<Vec<OddsPayload>> {
        self.get_json(&format!("/api/odds/snapshot/{fixture_id}")).await
    }

    pub async fn scores_snapshot(&self, fixture_id: i64) -> anyhow::Result<Vec<Scores>> {
        self.get_json(&format!("/api/scores/snapshot/{fixture_id}")).await
    }

    /// Merkle proof bundle for stats of one scores event (validateStatV2 contract:
    /// statKeys order is part of the proof). Returned raw; anchored at settlement.
    pub async fn stat_validation(
        &self,
        fixture_id: i64,
        seq: i32,
        stat_keys: &str,
    ) -> anyhow::Result<serde_json::Value> {
        self.get_json(&format!(
            "/api/scores/stat-validation?fixtureId={fixture_id}&seq={seq}&statKeys={stat_keys}"
        ))
        .await
    }

    /// Raw SSE response for /api/odds/stream or /api/scores/stream; caller parses lines.
    // (used from ingest, Task 5)
    pub async fn open_stream(&self, path: &str, last_event_id: Option<&str>) -> anyhow::Result<reqwest::Response> {
        let url = format!("{}{}", self.base, path);
        let mut req = self.http.get(&url);
        if let Some(id) = last_event_id {
            req = req.header("Last-Event-ID", id);
        }
        let res = req.send().await?;
        if !res.status().is_success() {
            anyhow::bail!("txline stream {path} -> {}", res.status());
        }
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // live devnet check: cargo test -p bluefin-api live_ -- --ignored --nocapture
    #[tokio::test]
    #[ignore]
    async fn live_snapshots() {
        dotenvy::dotenv().ok();
        let c = TxlineClient::new(
            &std::env::var("TXLINE_BASE_URL").unwrap(),
            &std::env::var("TXLINE_JWT").unwrap(),
            &std::env::var("TXLINE_API_TOKEN").unwrap(),
        )
        .unwrap();
        let fixtures = c.fixtures_snapshot(72).await.unwrap();
        assert!(!fixtures.is_empty(), "expected World Cup fixtures");
        println!("fixtures: {}", fixtures.len());
        let odds = c.odds_snapshot(fixtures[0].fixture_id).await.unwrap_or_default();
        println!("odds[{}]: {} rows", fixtures[0].fixture_id, odds.len());
        let scores = c.scores_snapshot(fixtures[0].fixture_id).await.unwrap_or_default();
        println!("scores[{}]: {} rows", fixtures[0].fixture_id, scores.len());
    }
}
