use anchor_lang::prelude::*;

use crate::error::BluefinError;
use crate::state::{Market, SIDE_NO, SIDE_YES};

#[derive(Accounts)]
pub struct Settle<'info> {
    #[account(constraint = authority.key() == market.authority)]
    pub authority: Signer<'info>,

    #[account(mut, constraint = !market.settled @ BluefinError::AlreadySettled)]
    pub market: Account<'info, Market>,
}

pub fn handler(ctx: Context<Settle>, winning_side: u8, merkle_root: [u8; 32]) -> Result<()> {
    require!(
        winning_side == SIDE_YES || winning_side == SIDE_NO,
        BluefinError::InvalidSide
    );
    // ponytail: merkle_root is anchored but not CPI-verified against the
    // TxODDS validation PDA; upgrade path = CPI into their devnet program here.
    let market = &mut ctx.accounts.market;
    market.settled = true;
    market.winning_side = winning_side;
    market.merkle_root = merkle_root;
    Ok(())
}
