"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAppStore } from "@/lib/store";
import { WALLET_BALANCE } from "@/lib/data";

const APP_LINKS = [
  { href: "/markets", label: "Markets" },
  { href: "/trade/esp-arg", label: "Trade", match: "/trade" },
  { href: "/bets", label: "My Bets" },
  { href: "/proofs", label: "Stats & Proofs" },
  { href: "/portfolio", label: "Portfolio" },
];

function NavButton({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const isHome = pathname === "/" || pathname === "/docs";
  const walletConnected = useAppStore((s) => s.walletConnected);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const openAuth = useAppStore((s) => s.openAuth);
  const disconnect = useAppStore((s) => s.disconnect);
  const { disconnect: disconnectAdapter, connected: adapterConnected } = useWallet();

  const handleLogout = () => {
    if (adapterConnected) void disconnectAdapter();
    disconnect();
    setWalletMenuOpen(false);
    router.push("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const links = (
    <>
      <NavButton href="/" label="Home" active={pathname === "/"} onClick={closeMenu} />
      {isHome ? (
        <>
          <NavButton href="/markets" label="Markets" active={false} onClick={closeMenu} />
          <NavButton href="/#about-section" label="About" active={false} onClick={closeMenu} />
          <NavButton href="/#how-it-works" label="How It Works" active={false} onClick={closeMenu} />
          <NavButton href="/#faq-section" label="FAQ" active={false} onClick={closeMenu} />
          <NavButton href="/docs" label="Docs" active={pathname === "/docs"} onClick={closeMenu} />
        </>
      ) : (
        APP_LINKS.map((l) => (
          <NavButton
            key={l.href}
            href={l.href}
            label={l.label}
            active={pathname.startsWith(l.match ?? l.href)}
            onClick={closeMenu}
          />
        ))
      )}
    </>
  );

  return (
    <div className="sticky top-0 z-50 bg-[rgba(11,22,35,0.78)] backdrop-blur-[14px] border-b border-line">
      <div className="flex items-center justify-between px-4 md:px-10 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <img
            src="/assets/bluefin-orca.svg"
            alt="Bluefin"
            className="w-8 h-8 object-contain orca-tint hover:animate-bobfloat"
          />
          <span className="font-heading text-base font-bold tracking-[3px] text-fg">BLUEFIN</span>
        </Link>
        <div className="flex items-center gap-3 lg:gap-[30px]">
          <div className="hidden lg:flex items-center gap-5 uppercase">{links}</div>
          {walletConnected ? (
            <div className="relative">
            <button onClick={() => setWalletMenuOpen((v) => !v)} className="flex items-center gap-3 cursor-pointer bg-transparent border-none">
              <span className="hidden sm:block text-right leading-[1.2]">
                <span className="block font-heading font-bold text-[13px] text-fg">{WALLET_BALANCE}</span>
                <span className="block font-semibold text-[11px] text-dim">{walletAddress}</span>
              </span>
              <span className="w-[34px] h-[34px] rounded-full bg-[#16283b] border border-btn-border flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="#4d9fff" strokeWidth="2" />
                  <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" stroke="#4d9fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {walletMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setWalletMenuOpen(false)} />
                <div className="absolute right-0 top-[46px] z-50 min-w-[180px] bg-[#0a0f16] border border-[#1c2937] rounded-[10px] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
                  <div className="px-3 py-2 font-semibold text-[11px] text-dim border-b border-[#1c2937]">{walletAddress}</div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-transparent border-none px-3 py-2.5 font-bold text-[13px] text-no cursor-pointer rounded-md hover:bg-[#12181f]"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="relative m-0.5 bg-[#e8503a] border-2 border-[#b93a28] text-white font-heading font-bold text-[10px] tracking-[1.8px] px-3 sm:px-5 py-[9px] sm:py-[11px] rounded-none cursor-pointer shadow-[0_0_0_1.5px_#ffffff] hover:bg-[#f0604a] hover:shadow-[0_0_0_1.5px_#ffffff,0_6px_18px_rgba(232,80,58,0.35)] transition-all"
            >
              CONNECT<span className="hidden sm:inline"> WALLET</span>
            </button>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="lg:hidden flex flex-col justify-center gap-[5px] w-9 h-9 bg-transparent border border-line-2 rounded-lg cursor-pointer items-center"
          >
            <span className={`block w-4 h-0.5 bg-fg transition-transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block w-4 h-0.5 bg-fg transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-4 h-0.5 bg-fg transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden flex flex-col items-start gap-1 px-5 pb-4 uppercase border-t border-line">
          {links}
        </div>
      )}
    </div>
  );
}
