"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useAppStore } from "@/lib/store";
import { WALLET_OPTIONS } from "@/lib/data";

function WalletLogo({ name }: { name: string }) {
  if (name === "Phantom")
    return (
      <svg width="22" height="22" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#7E40E8"/>
        <path d="M110 57.5C110 84 88.5 105.5 62 105.5C35.5 105.5 14 84 14 57.5C14 31 35.5 9.5 62 9.5C88.5 9.5 110 31 110 57.5Z" fill="#7E40E8"/>
        <path d="M108 56.8C108 44.3 96.8 34.2 83.2 34.2C77.3 34.2 71.9 36.2 67.6 39.6C67.6 39.6 60.4 34.2 50.7 34.2C37.1 34.2 26 44.3 26 56.8C26 69.3 37.1 79.4 50.7 79.4L50.7 90L66.4 79.4C66.8 79.4 67.2 79.5 67.6 79.5L83.2 79.4C96.8 79.4 108 69.3 108 56.8ZM50 62.3C47.2 62.3 45 60.1 45 57.3C45 54.5 47.2 52.3 50 52.3C52.8 52.3 55 54.5 55 57.3C55 60.1 52.8 62.3 50 62.3ZM72.5 62.3C69.7 62.3 67.5 60.1 67.5 57.3C67.5 54.5 69.7 52.3 72.5 52.3C75.3 52.3 77.5 54.5 77.5 57.3C77.5 60.1 75.3 62.3 72.5 62.3Z" fill="white"/>
      </svg>
    );
  if (name === "MetaMask")
    return (
      <svg width="22" height="22" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#1C1C1E"/>
        <path d="M104 24L70 49.5L76.5 36L104 24Z" fill="#E17726"/>
        <path d="M24 24L57.7 49.7L51.5 36L24 24Z" fill="#E27625"/>
        <path d="M91.5 80L82 93.5L102 99L108 80.5L91.5 80Z" fill="#E27625"/>
        <path d="M20 80.5L26 99L46 93.5L36.5 80L20 80.5Z" fill="#E27625"/>
        <path d="M45 60L38.5 70L58 71L57.3 50L45 60Z" fill="#E27625"/>
        <path d="M83 60L70.5 49.8L70 71L89.5 70L83 60Z" fill="#E27625"/>
        <path d="M46 93.5L56.5 88.5L47.5 81L46 93.5Z" fill="#E27625"/>
        <path d="M71.5 88.5L82 93.5L80.5 81L71.5 88.5Z" fill="#E27625"/>
      </svg>
    );
  if (name === "Backpack")
    return (
      <svg width="22" height="22" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#E33E3E"/>
        <path d="M64 22C55.2 22 48 29.2 48 38V42H32C27.6 42 24 45.6 24 50V98C24 102.4 27.6 106 32 106H96C100.4 106 104 102.4 104 98V50C104 45.6 100.4 42 96 42H80V38C80 29.2 72.8 22 64 22ZM64 30C68.4 30 72 33.6 72 38V42H56V38C56 33.6 59.6 30 64 30ZM56 70H72V78H56V70Z" fill="white"/>
      </svg>
    );
  if (name === "Coinbase Wallet")
    return (
      <svg width="22" height="22" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#0052FF"/>
        <path d="M64 20C39.7 20 20 39.7 20 64C20 88.3 39.7 108 64 108C88.3 108 108 88.3 108 64C108 39.7 88.3 20 64 20ZM64 82C54.1 82 46 73.9 46 64C46 54.1 54.1 46 64 46C73.9 46 82 54.1 82 64C82 73.9 73.9 82 64 82Z" fill="white"/>
        <rect x="54" y="56" width="20" height="16" rx="4" fill="white"/>
      </svg>
    );
  // fallback
  return <span className="text-base leading-none">{WALLET_OPTIONS.find((w) => w.name === name)?.icon ?? "●"}</span>;
}

export default function AuthModal() {
  const authOpen = useAppStore((s) => s.authOpen);
  const closeAuth = useAppStore((s) => s.closeAuth);
  const confirmAuth = useAppStore((s) => s.confirmAuth);
  const flashToast = useAppStore((s) => s.flashToast);
  const { wallets, select } = useWallet();

  if (!authOpen) return null;

  const connectWallet = async (name: string) => {
    const phantom = wallets.find((w) => w.adapter.name === "Phantom");
    if (name === "Phantom" && phantom && phantom.readyState === WalletReadyState.Installed) {
      select(phantom.adapter.name);
      try {
        await phantom.adapter.connect();
        // WalletSync in providers.tsx picks up the publicKey and updates the store
      } catch {
        flashToast("Wallet connection cancelled");
      }
      return;
    }
    // ponytail: non-Phantom wallets are demo-mode only; real adapters when needed
    confirmAuth();
    flashToast(name === "Phantom" ? "Phantom not detected — demo wallet connected" : "Demo wallet connected");
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[rgba(4,9,15,0.75)] flex items-center justify-center">
      <div className="w-[360px] bg-[#0a0f16] border border-[#1c2937] rounded-[10px] p-6 box-border relative">
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
          {WALLET_OPTIONS.map((w) => (
            <button
              key={w.name}
              onClick={() => connectWallet(w.name)}
              className="w-full box-border flex items-center gap-3 bg-[#12181f] border border-[#1c2937] hover:border-[#2f5fa8] text-fg font-bold text-[13px] px-3.5 py-3 rounded-lg cursor-pointer transition-colors duration-200"
            >
              <WalletLogo name={w.name} />
              {w.name}
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
