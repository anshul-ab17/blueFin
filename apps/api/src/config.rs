#[derive(Clone, Debug)]
pub struct Config {
    pub bind_addr: String,
    pub database_url: String,
    pub txline_base_url: String,
    pub txline_jwt: String,
    pub txline_api_token: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        dotenvy::dotenv().ok();
        Ok(Self {
            // Bind loopback by default so the plaintext port is never publicly reachable;
            // TLS is terminated by nginx + certbot in front (see infra/nginx/bluefin-api.conf).
            bind_addr: std::env::var("BIND_ADDR").unwrap_or_else(|_| "127.0.0.1:8787".into()),
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite://bluefin.db?mode=rwc".into()),
            txline_base_url: std::env::var("TXLINE_BASE_URL")
                .unwrap_or_else(|_| "https://txline-dev.txodds.com".into()),
            txline_jwt: std::env::var("TXLINE_JWT").unwrap_or_default(),
            txline_api_token: std::env::var("TXLINE_API_TOKEN").unwrap_or_default(),
        })
    }
}
