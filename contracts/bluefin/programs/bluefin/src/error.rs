use anchor_lang::prelude::*;

#[error_code]
pub enum BluefinError {
    #[msg("Market already settled")]
    AlreadySettled,
    #[msg("Market not settled yet")]
    NotSettled,
    #[msg("Position is not on the winning side")]
    NotWinner,
    #[msg("Invalid side, must be 0 (YES) or 1 (NO)")]
    InvalidSide,
    #[msg("Escrow cannot cover worst-case payout for this bet")]
    ExposureExceeded,
    #[msg("Odds must be at least 1.00x (10000 bps)")]
    InvalidOdds,
    #[msg("Stake must be greater than zero")]
    InvalidStake,
}
