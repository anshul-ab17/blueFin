"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAppStore } from "@/lib/store";
import { WALLET_BALANCE } from "@/lib/data";

const APP_LINKS = [
  { href: "/markets", label: "Markets" },
  { href: "/trade/arg-fra", label: "Trade", match: "/trade" },
  { href: "/bets", label: "My Bets" },
  { href: "/proofs", label: "Stats & Proofs" },
  { href: "/portfolio", label: "Portfolio" },
];

function NavButton({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-0.5 py-2 text-[13px] uppercase ${
        active ? "font-bold text-accent" : "font-semibold text-muted"
      } hover:text-accent-soft no-underline`}
    >
      [ {label} ]
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const walletConnected = useAppStore((s) => s.walletConnected);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const openAuth = useAppStore((s) => s.openAuth);
  const disconnect = useAppStore((s) => s.disconnect);
  const { disconnect: disconnectAdapter, connected: adapterConnected } = useWallet();

  const handleDisconnect = () => {
    if (adapterConnected) void disconnectAdapter();
    disconnect();
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-10 py-4 bg-[rgba(13,27,42,0.94)] backdrop-blur-[10px] border-b border-line">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <img
          src="/assets/bluefin-orca.svg"
          alt="Bluefin"
          className="w-8 h-8 object-contain orca-tint hover:animate-bobfloat"
        />
        <span className="font-heading text-base font-bold tracking-[3px] text-fg">BLUEFIN</span>
      </Link>
      <div className="flex items-center gap-[30px]">
        <div className="flex items-center gap-5 uppercase">
          <NavButton href="/" label="Home" active={isHome} />
          {isHome ? (
            <>
              <NavButton href="/#about-section" label="About" active={false} />
              <NavButton href="/#how-it-works" label="How It Work" active={false} />
              <NavButton href="/#faq-section" label="FAQ" active={false} />
            </>
          ) : (
            APP_LINKS.map((l) => (
              <NavButton
                key={l.href}
                href={l.href}
                label={l.label}
                active={pathname.startsWith(l.match ?? l.href)}
              />
            ))
          )}
        </div>
        {walletConnected ? (
          <button onClick={handleDisconnect} className="flex items-center gap-3 cursor-pointer bg-transparent border-none">
            <span className="text-right leading-[1.2]">
              <span className="block font-heading font-bold text-[13px] text-fg">{WALLET_BALANCE}</span>
              <span className="block font-semibold text-[11px] text-dim">{walletAddress}</span>
            </span>
            <span className="w-[34px] h-[34px] rounded-full bg-[#16283b] border border-btn-border flex items-center justify-center">
              <svg width="16" height="20" viewBox="0 0 22 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 6V26" stroke="#4d9fff" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 2C4 6 6 9 11 9C16 9 18 6 18 2" stroke="#4d9fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        ) : (
          <button
            onClick={openAuth}
            className="relative bg-[#e5484d] border-2 border-white text-white font-heading font-bold text-[10px] tracking-[1.8px] px-[19px] py-2.5 cursor-pointer"
          >
            CONNECT WALLET
          </button>
        )}
      </div>
    </div>
  );
}
