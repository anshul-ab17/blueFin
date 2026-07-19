"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { useAppStore } from "@/lib/store";

// shown with an INSTALL link when the browser doesn't have them; real
// wallet-standard detection replaces these entries once installed
const FALLBACK_WALLETS = [
  {
    name: "Backpack",
    url: "https://backpack.app/download",
    logo: (
      <svg width="22" height="22" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#E33E3E"/>
        <path d="M64 22C55.2 22 48 29.2 48 38V42H32C27.6 42 24 45.6 24 50V98C24 102.4 27.6 106 32 106H96C100.4 106 104 102.4 104 98V50C104 45.6 100.4 42 96 42H80V38C80 29.2 72.8 22 64 22ZM64 30C68.4 30 72 33.6 72 38V42H56V38C56 33.6 59.6 30 64 30ZM56 70H72V78H56V70Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "Coinbase Wallet",
    url: "https://www.coinbase.com/wallet/downloads",
    logo: (
      <svg width="22" height="22" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#0052FF"/>
        <path d="M64 20C39.7 20 20 39.7 20 64C20 88.3 39.7 108 64 108C88.3 108 108 88.3 108 64C108 39.7 88.3 20 64 20ZM64 82C54.1 82 46 73.9 46 64C46 54.1 54.1 46 64 46C73.9 46 82 54.1 82 64C82 73.9 73.9 82 64 82Z" fill="white"/>
        <rect x="54" y="56" width="20" height="16" rx="4" fill="white"/>
      </svg>
    ),
  },
  {
    name: "Solflare",
    url: "https://solflare.com/download",
    logo: (
      <svg width="22" height="22" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#1B1B1B"/>
        <circle cx="64" cy="64" r="18" fill="#FFC10B"/>
        <path d="M64 14v22M64 92v22M114 64H92M36 64H14M99 29 84 44M44 84 29 99M99 99 84 84M44 44 29 29" stroke="#FFC10B" strokeWidth="8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function AuthModal() {
  const authOpen = useAppStore((s) => s.authOpen);
  const closeAuth = useAppStore((s) => s.closeAuth);
  const flashToast = useAppStore((s) => s.flashToast);
  const { wallets, wallet, select, connect, connected } = useWallet();
  const [pending, setPending] = useState<WalletName | null>(null);
  const router = useRouter();

  // navigate once connected, whichever path (manual connect or autoConnect) won
  useEffect(() => {
    if (connected && authOpen) router.push("/markets");
  }, [connected, authOpen, router]);

  // connect only after the provider has flushed the selection, otherwise the
  // connect event fires before the provider subscribes and the UI never updates
  useEffect(() => {
    if (!pending || wallet?.adapter.name !== pending) return;
    setPending(null);
    if (wallet.adapter.connected) return;
    connect().catch(() => {
      // autoConnect may have raced us and already own the session —
      // only surface the toast on a real rejection
      if (!wallet.adapter.connected) flashToast("Wallet connection cancelled");
    });
  }, [pending, wallet, connect, flashToast]);

  if (!authOpen) return null;

  const installed = (state: WalletReadyState) =>
    state === WalletReadyState.Installed || state === WalletReadyState.Loadable;

  const connectWallet = (name: WalletName) => {
    const target = wallets.find((w) => w.adapter.name === name);
    if (!target) return;
    if (!installed(target.readyState)) {
      flashToast(`${name} not detected — opening install page`);
      window.open(target.adapter.url, "_blank", "noopener");
      return;
    }
    select(name);
    setPending(name);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[rgba(4,9,15,0.75)] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] bg-[#0a0f16] border border-[#1c2937] rounded-[10px] p-6 box-border relative">
        <button
          onClick={closeAuth}
          className="absolute top-4 right-[18px] bg-transparent border-none text-dim text-lg cursor-pointer leading-none"
        >
          ×
        </button>
        <div className="flex justify-between items-center mb-[22px]">
          <span className="font-heading font-bold text-[11px] tracking-[1.5px] text-dim">BLUEFIN</span>
        </div>
        <div className="font-heading font-bold text-[22px] text-fg mb-2">Connect Wallet</div>
        <div className="font-bold text-[11px] tracking-[1px] text-dim mb-[22px]">
          SELECT YOUR WALLET TO CONTINUE
        </div>
        <div className="flex flex-col gap-2.5 mb-[22px]">
          {wallets.map((w) => (
            <button
              key={w.adapter.name}
              onClick={() => connectWallet(w.adapter.name)}
              className="w-full box-border flex items-center gap-3 bg-[#12181f] border border-[#1c2937] hover:border-[#2f5fa8] text-fg font-bold text-[13px] px-3.5 py-3 rounded-lg cursor-pointer transition-colors duration-200"
            >
              <img src={w.adapter.icon} alt="" className="w-[22px] h-[22px] rounded-md" />
              <span className="flex-1 text-left">{w.adapter.name}</span>
              {!installed(w.readyState) && (
                <span className="font-semibold text-[10px] tracking-[1px] text-faint">INSTALL</span>
              )}
            </button>
          ))}
          {FALLBACK_WALLETS.filter((f) => !wallets.some((w) => w.adapter.name === f.name)).map((f) => (
            <button
              key={f.name}
              onClick={() => {
                flashToast(`${f.name} not detected — opening install page`);
                window.open(f.url, "_blank", "noopener");
              }}
              className="w-full box-border flex items-center gap-3 bg-[#12181f] border border-[#1c2937] hover:border-[#2f5fa8] text-fg font-bold text-[13px] px-3.5 py-3 rounded-lg cursor-pointer transition-colors duration-200"
            >
              {f.logo}
              <span className="flex-1 text-left">{f.name}</span>
              <span className="font-semibold text-[10px] tracking-[1px] text-faint">INSTALL</span>
            </button>
          ))}
        </div>
        <div className="flex justify-between font-semibold text-[11px] text-faint">
          <span>POWERED BY TXLINE</span>
        </div>
      </div>
    </div>
  );
}
