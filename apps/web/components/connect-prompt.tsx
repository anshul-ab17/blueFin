"use client";

import { useAppStore } from "@/lib/store";

export default function ConnectPrompt({
  title,
  subtitle,
  showIcon = false,
}: {
  title: string;
  subtitle: string;
  showIcon?: boolean;
}) {
  const openAuth = useAppStore((s) => s.openAuth);
  return (
    <div className="bg-panel border border-line rounded-[14px] px-5 py-[60px] text-center">
      {showIcon && (
        <div className="flex justify-center mb-3.5">
          <svg width="24" height="30" viewBox="0 0 22 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 6V26" stroke="#4d9fff" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 2C4 6 6 9 11 9C16 9 18 6 18 2" stroke="#4d9fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}
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
