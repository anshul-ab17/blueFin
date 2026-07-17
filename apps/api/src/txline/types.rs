use serde::Deserialize;

/// /api/fixtures/snapshot item (PascalCase feed)
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Fixture {
    pub ts: i64,
    pub start_time: i64,
    pub competition: String,
    pub competition_id: i32,
    pub participant1_id: i32,
    pub participant1: String,
    pub participant2_id: i32,
    pub participant2: String,
    pub fixture_id: i64,
    pub participant1_is_home: bool,
    /// 1 = scheduled, 6 = cancelled
    #[serde(default)]
    pub game_state: Option<i32>,
}

/// /api/odds/snapshot + /api/odds/stream item (PascalCase feed)
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct OddsPayload {
    pub fixture_id: i64,
    pub message_id: String,
    pub ts: i64,
    pub super_odds_type: String,
    pub in_running: bool,
    #[serde(default)]
    pub game_state: Option<String>,
    #[serde(default)]
    pub market_parameters: Option<String>,
    #[serde(default)]
    pub market_period: Option<String>,
    #[serde(default)]
    pub price_names: Vec<String>,
    #[serde(default)]
    pub prices: Vec<i32>,
    /// StablePrice implied percentages, "52.632" or "NA", aligned with price_names
    #[serde(default)]
    pub pct: Vec<String>,
}

/// /api/scores/* item (camelCase feed). Only the fields settlement/markets need.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Scores {
    pub fixture_id: i64,
    pub game_state: String,
    pub start_time: i64,
    pub competition_id: i32,
    pub action: String,
    pub ts: i64,
    pub seq: i32,
    /// e.g. {"NS2":{}}-style oneOf; raw code extracted via status_code()
    #[serde(default)]
    pub status_soccer_id: Option<serde_json::Value>,
    #[serde(default)]
    pub status_id: Option<serde_json::Value>,
    #[serde(default)]
    pub score_soccer: Option<SoccerFixtureScore>,
}

impl Scores {
    /// Final-score records use action=game_finalised with statusId=100/period=100.
    pub fn is_final(&self) -> bool {
        self.action == "game_finalised"
    }

    pub fn goals(&self) -> Option<(i32, i32)> {
        let s = self.score_soccer.as_ref()?;
        Some((
            s.participant1.total.as_ref()?.goals,
            s.participant2.total.as_ref()?.goals,
        ))
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct SoccerFixtureScore {
    pub participant1: SoccerTotalScore,
    pub participant2: SoccerTotalScore,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct SoccerTotalScore {
    #[serde(default)]
    pub total: Option<SoccerScore>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct SoccerScore {
    pub goals: i32,
}
