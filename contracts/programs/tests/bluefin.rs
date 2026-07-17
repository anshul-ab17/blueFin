use anchor_lang::prelude::Pubkey;
use anchor_lang::solana_program::instruction::{AccountMeta, Instruction};
use anchor_lang::{AccountDeserialize, InstructionData, ToAccountMetas};
use litesvm::LiteSVM;
use litesvm_token::{spl_token, CreateAssociatedTokenAccount, CreateMint, MintTo};
use solana_keypair::Keypair;
use solana_message::Message;
use solana_signer::Signer;
use solana_transaction::Transaction;

use bluefin::state::{Market, SIDE_NO, SIDE_YES};

const MARKET_ID: [u8; 16] = *b"arg-fra\0\0\0\0\0\0\0\0\0";
const USDT: u64 = 1_000_000; // 6 dp

struct Env {
    svm: LiteSVM,
    authority: Keypair,
    mint: Pubkey,
    market: Pubkey,
    escrow: Pubkey,
}

fn position_pda(market: &Pubkey, bettor: &Pubkey, nonce: u64) -> Pubkey {
    Pubkey::find_program_address(
        &[b"position", market.as_ref(), bettor.as_ref(), &nonce.to_le_bytes()],
        &bluefin::ID,
    )
    .0
}

fn send(svm: &mut LiteSVM, ixs: &[Instruction], payer: &Keypair, signers: &[&Keypair]) -> Result<(), String> {
    let msg = Message::new(ixs, Some(&payer.pubkey()));
    let tx = Transaction::new(signers, msg, svm.latest_blockhash());
    svm.send_transaction(tx).map(|_| ()).map_err(|e| format!("{:?}", e.err))
}

/// init_market + seed escrow with house liquidity.
fn setup() -> Env {
    let mut svm = LiteSVM::new();
    svm.add_program_from_file(bluefin::ID, "../target/deploy/bluefin.so")
        .expect("run `anchor build` first");

    let authority = Keypair::new();
    svm.airdrop(&authority.pubkey(), 10_000_000_000).unwrap();

    let mint = CreateMint::new(&mut svm, &authority).decimals(6).send().unwrap();
    let market = Pubkey::find_program_address(&[b"market", MARKET_ID.as_ref()], &bluefin::ID).0;
    let escrow = Pubkey::find_program_address(&[b"escrow", MARKET_ID.as_ref()], &bluefin::ID).0;

    let ix = Instruction {
        program_id: bluefin::ID,
        accounts: bluefin::accounts::InitMarket {
            authority: authority.pubkey(),
            market,
            mint,
            escrow,
            token_program: spl_token::ID,
            system_program: anchor_lang::system_program::ID,
        }
        .to_account_metas(None),
        data: bluefin::instruction::InitMarket { market_id: MARKET_ID }.data(),
    };
    send(&mut svm, &[ix], &authority, &[&authority]).unwrap();

    // house liquidity so bets pass the exposure check
    MintTo::new(&mut svm, &authority, &mint, &escrow, 10_000 * USDT).send().unwrap();

    Env { svm, authority, mint, market, escrow }
}

fn new_bettor(env: &mut Env, funds: u64) -> (Keypair, Pubkey) {
    let bettor = Keypair::new();
    env.svm.airdrop(&bettor.pubkey(), 10_000_000_000).unwrap();
    let ata = CreateAssociatedTokenAccount::new(&mut env.svm, &bettor, &env.mint)
        .owner(&bettor.pubkey())
        .send()
        .unwrap();
    MintTo::new(&mut env.svm, &env.authority, &env.mint, &ata, funds).send().unwrap();
    (bettor, ata)
}

fn place_bet_ix(env: &Env, bettor: &Pubkey, ata: &Pubkey, side: u8, stake: u64, odds_bps: u32, nonce: u64) -> Instruction {
    Instruction {
        program_id: bluefin::ID,
        accounts: bluefin::accounts::PlaceBet {
            bettor: *bettor,
            quote_authority: env.authority.pubkey(),
            market: env.market,
            mint: env.mint,
            position: position_pda(&env.market, bettor, nonce),
            bettor_token: *ata,
            escrow: env.escrow,
            token_program: spl_token::ID,
            system_program: anchor_lang::system_program::ID,
        }
        .to_account_metas(None),
        data: bluefin::instruction::PlaceBet { side, stake, odds_bps, nonce }.data(),
    }
}

fn settle_ix(env: &Env, authority: &Pubkey, winning_side: u8, merkle_root: [u8; 32]) -> Instruction {
    Instruction {
        program_id: bluefin::ID,
        accounts: bluefin::accounts::Settle { authority: *authority, market: env.market }.to_account_metas(None),
        data: bluefin::instruction::Settle { winning_side, merkle_root }.data(),
    }
}

fn claim_ix(env: &Env, bettor: &Pubkey, ata: &Pubkey, nonce: u64) -> Instruction {
    Instruction {
        program_id: bluefin::ID,
        accounts: bluefin::accounts::Claim {
            bettor: *bettor,
            market: env.market,
            mint: env.mint,
            position: position_pda(&env.market, bettor, nonce),
            escrow: env.escrow,
            bettor_token: *ata,
            token_program: spl_token::ID,
        }
        .to_account_metas(None),
        data: bluefin::instruction::Claim {}.data(),
    }
}

fn token_balance(svm: &LiteSVM, ata: &Pubkey) -> u64 {
    litesvm_token::get_spl_account::<spl_token::state::Account>(svm, ata).unwrap().amount
}

#[test]
fn happy_path_init_bet_settle_claim() {
    let mut env = setup();
    let (bettor, ata) = new_bettor(&mut env, 1_000 * USDT);

    // 100 USDT at 1.8x on YES
    let ix = place_bet_ix(&env, &bettor.pubkey(), &ata, SIDE_YES, 100 * USDT, 18_000, 1);
    send(&mut env.svm, &[ix], &bettor, &[&bettor, &env.authority]).unwrap();
    assert_eq!(token_balance(&env.svm, &ata), 900 * USDT);

    let market: Market = {
        let data = env.svm.get_account(&env.market).unwrap().data;
        Market::try_deserialize(&mut data.as_slice()).unwrap()
    };
    assert_eq!(market.liability_yes, 180 * USDT);
    assert!(!market.settled);

    let ix = settle_ix(&env, &env.authority.pubkey(), SIDE_YES, [7u8; 32]);
    let authority = env.authority.insecure_clone();
    send(&mut env.svm, &[ix], &authority, &[&authority]).unwrap();

    let ix = claim_ix(&env, &bettor.pubkey(), &ata, 1);
    send(&mut env.svm, &[ix], &bettor, &[&bettor]).unwrap();
    assert_eq!(token_balance(&env.svm, &ata), 1_080 * USDT); // 900 + 180 payout

    // position closed
    let pos = position_pda(&env.market, &bettor.pubkey(), 1);
    assert!(env.svm.get_account(&pos).map_or(true, |a| a.data.is_empty()));
}

#[test]
fn rejects_wrong_oracle_settle() {
    let mut env = setup();
    let intruder = Keypair::new();
    env.svm.airdrop(&intruder.pubkey(), 1_000_000_000).unwrap();
    let ix = settle_ix(&env, &intruder.pubkey(), SIDE_YES, [1u8; 32]);
    let err = send(&mut env.svm, &[ix], &intruder, &[&intruder]).unwrap_err();
    assert!(err.contains("2003"), "expected constraint violation, got: {err}"); // ConstraintRaw
}

#[test]
fn rejects_double_settle() {
    let mut env = setup();
    let authority = env.authority.insecure_clone();
    let ix = settle_ix(&env, &authority.pubkey(), SIDE_YES, [1u8; 32]);
    send(&mut env.svm, &[ix], &authority, &[&authority]).unwrap();
    // different root so the tx isn't a duplicate
    let ix = settle_ix(&env, &authority.pubkey(), SIDE_NO, [2u8; 32]);
    let err = send(&mut env.svm, &[ix], &authority, &[&authority]).unwrap_err();
    assert!(err.contains("AlreadySettled") || err.contains("6000"), "got: {err}");
}

#[test]
fn rejects_loser_claim() {
    let mut env = setup();
    let (bettor, ata) = new_bettor(&mut env, 1_000 * USDT);
    let ix = place_bet_ix(&env, &bettor.pubkey(), &ata, SIDE_NO, 100 * USDT, 18_000, 1);
    send(&mut env.svm, &[ix], &bettor, &[&bettor, &env.authority]).unwrap();

    let authority = env.authority.insecure_clone();
    let ix = settle_ix(&env, &authority.pubkey(), SIDE_YES, [3u8; 32]);
    send(&mut env.svm, &[ix], &authority, &[&authority]).unwrap();

    let ix = claim_ix(&env, &bettor.pubkey(), &ata, 1);
    let err = send(&mut env.svm, &[ix], &bettor, &[&bettor]).unwrap_err();
    assert!(err.contains("NotWinner") || err.contains("6002"), "got: {err}");
}

#[test]
fn rejects_missing_quote_signer() {
    let mut env = setup();
    let (bettor, ata) = new_bettor(&mut env, 1_000 * USDT);
    let mut ix = place_bet_ix(&env, &bettor.pubkey(), &ata, SIDE_YES, 100 * USDT, 18_000, 1);
    // strip the quote_authority signer flag so only the bettor signs
    ix.accounts[1] = AccountMeta::new_readonly(env.authority.pubkey(), false);
    let err = send(&mut env.svm, &[ix], &bettor, &[&bettor]).unwrap_err();
    assert!(err.contains("Signature") || err.contains("3010") || err.contains("AccountNotSigner"), "got: {err}");
}

#[test]
fn rejects_bet_exceeding_escrow_exposure() {
    let mut env = setup();
    let (bettor, ata) = new_bettor(&mut env, 100_000 * USDT);
    // payout would be 200_000 USDT > escrow (10_000) + stake (100_000)
    let ix = place_bet_ix(&env, &bettor.pubkey(), &ata, SIDE_YES, 100_000 * USDT, 20_000, 1);
    let err = send(&mut env.svm, &[ix], &bettor, &[&bettor, &env.authority]).unwrap_err();
    assert!(err.contains("ExposureExceeded") || err.contains("6004"), "got: {err}");
}
