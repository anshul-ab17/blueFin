use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::constants::{ESCROW_SEED, MARKET_SEED};
use crate::state::Market;

#[derive(Accounts)]
#[instruction(market_id: [u8; 16])]
pub struct InitMarket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Market::INIT_SPACE,
        seeds = [MARKET_SEED, market_id.as_ref()],
        bump,
    )]
    pub market: Account<'info, Market>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = authority,
        seeds = [ESCROW_SEED, market_id.as_ref()],
        bump,
        token::mint = mint,
        token::authority = market,
        token::token_program = token_program,
    )]
    pub escrow: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitMarket>, market_id: [u8; 16]) -> Result<()> {
    let market = &mut ctx.accounts.market;
    market.market_id = market_id;
    market.authority = ctx.accounts.authority.key();
    market.mint = ctx.accounts.mint.key();
    market.escrow = ctx.accounts.escrow.key();
    market.liability_yes = 0;
    market.liability_no = 0;
    market.settled = false;
    market.winning_side = 0;
    market.merkle_root = [0u8; 32];
    market.bump = ctx.bumps.market;
    Ok(())
}
