"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import ConnectPrompt from "@/components/connect-prompt";
import PageBackdrop from "@/components/page-backdrop";
import StatBox from "@/components/stat-box";
import { CountUp, Magnetic, PageTitle, Reveal } from "@/components/fx";
import { useAppStore } from "@/lib/store";

export default function PortfolioPage() {
  const walletConnected = useAppStore((s) => s.walletConnected);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const disconnect = useAppStore((s) => s.disconnect);
  const bets = useAppStore((s) => s.bets);
  const { disconnect: disconnectAdapter, connected: adapterConnected } = useWallet();
  const router = useRouter();

  const handleDisconnect = () => {
    if (adapterConnected) void disconnectAdapter();
    disconnect();
    router.push("/");
  };

  const totalStaked = bets.reduce((a, b) => a + b.stake, 0);
  const totalPayout = bets.reduce((a, b) => a + b.payout, 0);

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-20">
      <PageBackdrop src="/assets/bg/water1.webp" />
      <PageTitle title="Portfolio" subtitle="Your wallet, activity, and preferences on Bluefin." />

      {!walletConnected ? (
        <ConnectPrompt
          title="Connect your wallet"
          subtitle="View your balance, positions, and settlement history."
        />
      ) : (
        <>
          <Reveal>
            <div className="bg-[linear-gradient(135deg,#101f30,#0f2135)] border border-btn-border rounded-2xl p-6 flex flex-wrap items-center gap-[18px] mb-5 shadow-[0_16px_44px_rgba(47,111,237,0.14)]">
              <div className="w-14 h-14 rounded-full bg-btn border border-btn-border flex items-center justify-center">
                <img
                  src="/assets/bluefin-orca.svg"
                  alt="avatar"
                  className="w-[30px] h-[30px] brightness-0 invert"
                />
              </div>
              <div className="flex-1">
                <div className="font-heading font-bold text-lg text-fg">{walletAddress}</div>
                <div className="font-semibold text-[13px] text-dim">
                  Balance: <CountUp value={1250} suffix=" USDC" className="text-muted" />
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.4)] px-3 py-[5px] rounded-full font-bold text-[11px] text-win">
                CONNECTED
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <Reveal delay={80}>
              <StatBox label="Open Positions" value={<CountUp value={bets.length} />} />
            </Reveal>
            <Reveal delay={140}>
              <StatBox label="Total Staked" value={<CountUp value={totalStaked} decimals={2} prefix="$" />} />
            </Reveal>
            <Reveal delay={200}>
              <StatBox
                label="Potential Payout"
                value={<CountUp value={totalPayout} decimals={2} prefix="$" />}
                valueClass="text-win"
              />
            </Reveal>
          </div>
          <Reveal delay={260}>
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Magnetic className="flex-1">
                <Link
                  href="/bets"
                  className="block bg-btn border border-btn-border !text-fg font-heading font-bold text-sm p-3.5 rounded-[10px] cursor-pointer no-underline text-center hover:bg-[#24498a] transition-colors"
                >
                  View My Bets
                </Link>
              </Magnetic>
              <button
                onClick={handleDisconnect}
                className="flex-1 bg-transparent border border-line-2 text-muted font-heading font-bold text-sm p-3.5 rounded-[10px] cursor-pointer hover:border-no hover:text-no transition-colors"
              >
                Disconnect
              </button>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
