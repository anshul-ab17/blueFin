"use client";

import { useState } from "react";
import PageBackdrop from "@/components/page-backdrop";
import { PROOFS } from "@/lib/data";

export default function ProofsPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="max-w-[1000px] mx-auto px-10 pt-12 pb-20">
      <PageBackdrop src="/assets/bg/water3.webp" />
      <h1 className="font-heading font-bold text-[30px] m-0 mb-1.5 text-fg">Stats & Proofs</h1>
      <p className="font-medium text-[15px] text-muted m-0 mb-8">
        Every settlement carries a cryptographic Merkle proof from TxLINE, anchored on Solana. No oracle trust
        required.
      </p>
      <div className="flex flex-col gap-3.5">
        {PROOFS.map((p) => (
          <div key={p.id} className="bg-panel border border-line rounded-[14px] overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left"
            >
              <div>
                <div className="font-heading font-bold text-[15px] text-fg">{p.event}</div>
                <div className="font-medium text-[13px] text-muted">
                  {p.market} · {p.outcome}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-live text-sm">✓</span>
                  <span className="font-bold text-xs text-win">Verified</span>
                </div>
                <div className="font-medium text-xs text-dim">{p.time}</div>
              </div>
            </button>
            {expanded === p.id && (
              <div className="border-t border-line px-[22px] py-[18px] bg-[#0a1a29]">
                <div className="font-semibold text-xs text-dim mb-1.5">Merkle Root</div>
                <div className="font-mono font-medium text-[13px] text-muted mb-3.5 break-all">{p.root}</div>
                <div className="font-semibold text-xs text-dim mb-1.5">Solana Signature</div>
                <div className="font-mono font-medium text-[13px] text-muted break-all">{p.sig}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
