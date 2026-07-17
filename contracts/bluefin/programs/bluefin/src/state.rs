use anchor_lang::prelude::*;

pub const SIDE_YES: u8 = 0;
pub const SIDE_NO: u8 = 1;

#[account]
#[derive(InitSpace)]
pub struct Market {
    /// Off-chain market id (e.g. b"arg-fra" zero-padded), fixed 16 bytes.
    pub market_id: [u8; 16],
    /// Backend key: oracle for settle, co-signer for place_bet quotes.
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub escrow: Pubkey,
    /// Worst-case payout owed per side if that side wins.
    pub liability_yes: u64,
    pub liability_no: u64,
    pub settled: bool,
    pub winning_side: u8,
    /// TxLINE Merkle root anchored at settlement.
    pub merkle_root: [u8; 32],
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub side: u8,
    pub stake: u64,
    pub odds_bps: u32,
    pub nonce: u64,
    pub bump: u8,
}

impl Position {
    pub fn payout(&self) -> u64 {
        ((self.stake as u128) * (self.odds_bps as u128) / 10_000) as u64
    }
}
