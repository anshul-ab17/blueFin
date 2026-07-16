"use client";

import { useAppStore } from "@/lib/store";

export default function ConnectPrompt({ title, subtitle }: { title: string; subtitle: string }) {
  const openAuth = useAppStore((s) => s.openAuth);
  return (
    <div className="bg-panel border border-line rounded-[14px] px-5 py-[60px] text-center">
      <div className="flex justify-center mb-3.5">
        <img src="/assets/bluefin-orca.svg" alt="Bluefin" className="w-12 h-12 object-contain orca-tint" />
      </div>
      <div className="font-heading font-bold text-base text-fg mb-2">{title}</div>
      <div className="font-medium text-[13px] text-muted mb-5">{subtitle}</div>
      <button
        onClick={openAuth}
        className="relative m-0.5 bg-[#e8503a] border-2 border-[#b93a28] text-white font-heading font-bold text-[10px] tracking-[1.8px] px-5 py-[11px] rounded-none cursor-pointer shadow-[0_0_0_1.5px_#ffffff] hover:bg-[#f0604a] hover:shadow-[0_0_0_1.5px_#ffffff,0_6px_18px_rgba(232,80,58,0.35)] transition-all"
      >
        CONNECT WALLET
      </button>
    </div>
  );
}
