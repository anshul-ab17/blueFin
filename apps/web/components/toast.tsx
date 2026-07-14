"use client";

import { useAppStore } from "@/lib/store";

export default function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[100] bg-[#132436] border border-[#2f5fa8] text-fg px-6 py-3.5 rounded-[10px] font-semibold text-sm shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {toast}
    </div>
  );
}
