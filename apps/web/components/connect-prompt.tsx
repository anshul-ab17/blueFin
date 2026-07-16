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
        className="relative bg-[#e5484d] border-2 border-white text-white font-heading font-bold text-[10px] tracking-[1.8px] px-[19px] py-2.5 cursor-pointer"
      >
        CONNECT WALLET
      </button>
    </div>
  );
}
