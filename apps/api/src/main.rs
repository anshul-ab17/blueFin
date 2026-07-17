mod config;
mod db;
mod http;
mod markets;
mod settlement;
mod state;
mod trades;
mod txline;

use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    let cfg = config::Config::from_env()?;
    let pool = db::connect(&cfg.database_url).await?;
    let txline = txline::TxlineClient::new(&cfg.txline_base_url, &cfg.txline_jwt, &cfg.txline_api_token)?;
    let (events, _) = tokio::sync::broadcast::channel(256);
    let state = state::AppState { db: pool, txline, events };

    if let Err(e) = txline::ingest::resync(&state).await {
        tracing::warn!(?e, "initial txline resync failed (check TXLINE_JWT/TXLINE_API_TOKEN)");
    }
    txline::ingest::spawn(state.clone());
    settlement::spawn(state.clone());

    let app = http::router(state);
    let listener = tokio::net::TcpListener::bind(&cfg.bind_addr).await?;
    tracing::info!("bluefin-api listening on {}", cfg.bind_addr);
    axum::serve(listener, app).await?;
    Ok(())
}
