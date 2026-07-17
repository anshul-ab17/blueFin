pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BbeCFPpsNTi5sqBNWjeXPtAitzqnDhYEMVxkLQodNH3B");

#[program]
pub mod bluefin {
    use super::*;

    pub fn init_market(ctx: Context<InitMarket>, market_id: [u8; 16]) -> Result<()> {
        init_market::handler(ctx, market_id)
    }

    pub fn place_bet(ctx: Context<PlaceBet>, side: u8, stake: u64, odds_bps: u32, nonce: u64) -> Result<()> {
        place_bet::handler(ctx, side, stake, odds_bps, nonce)
    }

    pub fn settle(ctx: Context<Settle>, winning_side: u8, merkle_root: [u8; 32]) -> Result<()> {
        settle::handler(ctx, winning_side, merkle_root)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        claim::handler(ctx)
    }
}
