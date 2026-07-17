use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};

use crate::constants::POSITION_SEED;
use crate::error::BluefinError;
use crate::state::{Market, Position, SIDE_NO, SIDE_YES};

#[derive(Accounts)]
#[instruction(side: u8, stake: u64, odds_bps: u32, nonce: u64)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    /// Backend co-signs the transaction to endorse the quoted odds.
    #[account(constraint = quote_authority.key() == market.authority)]
    pub quote_authority: Signer<'info>,

    #[account(mut, constraint = !market.settled @ BluefinError::AlreadySettled)]
    pub market: Account<'info, Market>,

    #[account(constraint = mint.key() == market.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = bettor,
        space = 8 + Position::INIT_SPACE,
        seeds = [POSITION_SEED, market.key().as_ref(), bettor.key().as_ref(), &nonce.to_le_bytes()],
        bump,
    )]
    pub position: Account<'info, Position>,

    #[account(mut, constraint = bettor_token.mint == market.mint)]
    pub bettor_token: InterfaceAccount<'info, TokenAccount>,

    #[account(mut, constraint = escrow.key() == market.escrow)]
    pub escrow: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PlaceBet>, side: u8, stake: u64, odds_bps: u32, nonce: u64) -> Result<()> {
    require!(side == SIDE_YES || side == SIDE_NO, BluefinError::InvalidSide);
    require!(stake > 0, BluefinError::InvalidStake);
    require!(odds_bps >= 10_000, BluefinError::InvalidOdds);

    let payout = ((stake as u128) * (odds_bps as u128) / 10_000) as u64;
    let market = &mut ctx.accounts.market;
    if side == SIDE_YES {
        market.liability_yes = market.liability_yes.checked_add(payout).unwrap();
    } else {
        market.liability_no = market.liability_no.checked_add(payout).unwrap();
    }

    // Escrow (after this deposit) must cover the worst-case winning side.
    let worst = market.liability_yes.max(market.liability_no);
    let escrow_after = ctx.accounts.escrow.amount.checked_add(stake).unwrap();
    require!(escrow_after >= worst, BluefinError::ExposureExceeded);

    token_interface::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.bettor_token.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
                authority: ctx.accounts.bettor.to_account_info(),
            },
        ),
        stake,
        ctx.accounts.mint.decimals,
    )?;

    let position = &mut ctx.accounts.position;
    position.market = market.key();
    position.bettor = ctx.accounts.bettor.key();
    position.side = side;
    position.stake = stake;
    position.odds_bps = odds_bps;
    position.nonce = nonce;
    position.bump = ctx.bumps.position;
    Ok(())
}
