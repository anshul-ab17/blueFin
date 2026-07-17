use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};

use crate::constants::{ESCROW_SEED, MARKET_SEED};
use crate::error::BluefinError;
use crate::state::{Market, Position};

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        seeds = [MARKET_SEED, market.market_id.as_ref()],
        bump = market.bump,
        constraint = market.settled @ BluefinError::NotSettled,
    )]
    pub market: Account<'info, Market>,

    #[account(constraint = mint.key() == market.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        close = bettor,
        constraint = position.market == market.key(),
        constraint = position.bettor == bettor.key(),
        constraint = position.side == market.winning_side @ BluefinError::NotWinner,
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, market.market_id.as_ref()],
        bump,
        constraint = escrow.key() == market.escrow,
    )]
    pub escrow: InterfaceAccount<'info, TokenAccount>,

    #[account(mut, constraint = bettor_token.mint == market.mint)]
    pub bettor_token: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(ctx: Context<Claim>) -> Result<()> {
    let payout = ctx.accounts.position.payout();
    let market = &ctx.accounts.market;
    let seeds: &[&[u8]] = &[MARKET_SEED, market.market_id.as_ref(), &[market.bump]];
    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.escrow.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.bettor_token.to_account_info(),
                authority: market.to_account_info(),
            },
            &[seeds],
        ),
        payout,
        ctx.accounts.mint.decimals,
    )?;
    Ok(())
}
