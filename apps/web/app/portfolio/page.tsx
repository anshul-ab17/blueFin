"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import ConnectPrompt from "@/components/connect-prompt";
import StatBox from "@/components/stat-box";
import { useAppStore } from "@/lib/store";
import { WALLET_BALANCE } from "@/lib/data";

export default function PortfolioPage() {
  const walletConnected = useAppStore((s) => s.walletConnected);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const disconnect = useAppStore((s) => s.disconnect);
  const bets = useAppStore((s) => s.bets);
  const { disconnect: disconnectAdapter, connected: adapterConnected } = useWallet();

  const handleDisconnect = () => {
    if (adapterConnected) void disconnectAdapter();
    disconnect();
  };

  const totalStaked = bets.reduce((a, b) => a + b.stake, 0);
  const totalPayout = bets.reduce((a, b) => a + b.payout, 0);

  return (
    <div className="max-w-[760px] mx-auto px-10 pt-12 pb-20">
      <h1 className="font-heading font-bold text-[30px] m-0 mb-1.5 text-fg">Portfolio</h1>
      <p className="font-medium text-[15px] text-muted m-0 mb-8">
        Your wallet, activity, and preferences on Bluefin.
      </p>

      {!walletConnected ? (
        <ConnectPrompt
          title="Connect your wallet"
          subtitle="View your balance, positions, and settlement history."
        />
      ) : (
        <>
          <div className="bg-panel border border-line rounded-[14px] p-6 flex items-center gap-[18px] mb-5">
            <div className="w-14 h-14 rounded-full bg-btn border border-btn-border flex items-center justify-center">
              <img
                src="/assets/bluefin-orca.svg"
                alt="avatar"
                className="w-[30px] h-[30px] brightness-0 invert"
              />
            </div>
            <div>
              <div className="font-heading font-bold text-lg text-fg">{walletAddress}</div>
              <div className="font-semibold text-[13px] text-dim">Balance: {WALLET_BALANCE}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <StatBox label="Open Positions" value={bets.length} />
            <StatBox label="Total Staked" value={`$${totalStaked.toFixed(2)}`} />
            <StatBox label="Potential Payout" value={`$${totalPayout.toFixed(2)}`} valueClass="text-win" />
          </div>
          <div className="flex gap-3.5">
            <Link
              href="/bets"
              className="flex-1 bg-btn border border-btn-border !text-fg font-heading font-bold text-sm p-3.5 rounded-[10px] cursor-pointer no-underline text-center"
            >
              View My Bets
            </Link>
            <button
              onClick={handleDisconnect}
              className="flex-1 bg-transparent border border-line-2 text-muted font-heading font-bold text-sm p-3.5 rounded-[10px] cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
