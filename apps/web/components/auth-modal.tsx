"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useAppStore } from "@/lib/store";
import { WALLET_OPTIONS } from "@/lib/data";

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
        <div className="font-heading font-bold text-[22px] text-fg mb-2">Connect</div>
        <div className="font-bold text-[11px] tracking-[1px] text-dim mb-[22px]">
          WITH GMAIL OR A WALLET
        </div>
        <button
          onClick={confirmAuth}
          className="w-full box-border flex items-center justify-center gap-2.5 bg-white border-none text-abyss font-bold text-[13px] tracking-[0.5px] py-[13px] rounded-lg cursor-pointer mb-5"
        >
          <span className="font-bold text-[15px] text-[#4285F4]">G</span>SIGN IN WITH GMAIL
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#1c2937]" />
          <span className="font-bold text-[11px] text-dim">OR</span>
          <div className="flex-1 h-px bg-[#1c2937]" />
        </div>

        <div className="font-bold text-[11px] tracking-[1px] text-dim mb-[22px]">
          CONNECT WITH WALLET
        </div>


        <div className="flex flex-col gap-2.5 mb-[22px]">
          {WALLET_OPTIONS.map((w) => (
            <button
              key={w.name}
              onClick={() => connectWallet(w.name)}
              className="w-full box-border flex items-center gap-3 bg-[#12181f] border border-[#1c2937] text-fg font-bold text-[13px] px-3.5 py-3 rounded-lg cursor-pointer"
            >
              <span className="text-base">{w.icon}</span>
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
