mod config;
mod db;
mod http;
mod state;
mod txline;

use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    let cfg = config::Config::from_env()?;
    let pool = db::connect(&cfg.database_url).await?;
    let state = state::AppState { db: pool };

    let app = http::router(state);
    let listener = tokio::net::TcpListener::bind(&cfg.bind_addr).await?;
    tracing::info!("bluefin-api listening on {}", cfg.bind_addr);
    axum::serve(listener, app).await?;
    Ok(())
}
