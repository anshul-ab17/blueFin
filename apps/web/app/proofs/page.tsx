"use client";

import { useState } from "react";
import PageBackdrop from "@/components/page-backdrop";
import StatBox from "@/components/stat-box";
import { CountUp, PageTitle, Reveal } from "@/components/fx";
import { PROOFS } from "@/lib/data";

export default function ProofsPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="max-w-[1000px] mx-auto px-5 md:px-10 pt-12 pb-20">
      <PageBackdrop src="/assets/bg/water3.webp" />
      <PageTitle
        title="Stats & Proofs"
        subtitle="Every settlement carries a cryptographic Merkle proof from TxLINE, anchored on Solana. No oracle trust required."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <Reveal>
          <StatBox label="Proofs Anchored" value={<CountUp value={1284} />} />
        </Reveal>
        <Reveal delay={80}>
          <StatBox label="Settlement Accuracy" value={<CountUp value={98.7} decimals={1} suffix="%" />} valueClass="text-win" />
        </Reveal>
        <Reveal delay={160}>
          <StatBox label="Avg Settlement Time" value={<CountUp value={0.4} decimals={1} suffix="s" />} valueClass="text-accent" />
        </Reveal>
      </div>
      <div className="flex flex-col gap-3.5">
        {PROOFS.map((p, i) => (
          <Reveal key={p.id} delay={i * 80}>
            <div className="bg-panel border border-line rounded-[14px] overflow-hidden transition-all duration-[250ms] hover:-translate-y-[3px] hover:border-btn-border">
              <button
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 cursor-pointer bg-transparent border-none text-left"
              >
                <div>
                  <div className="font-heading font-bold text-[15px] text-fg">{p.event}</div>
                  <div className="font-medium text-[13px] text-muted">
                    {p.market} · {p.outcome}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center gap-1.5 bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.4)] px-2.5 py-1 rounded-full">
                    <span className="text-live text-[13px]">✓</span>
                    <span className="font-bold text-xs text-win">Verified</span>
                  </div>
                  <div className="font-medium text-xs text-dim">{p.time}</div>
                  <span
                    className="font-heading font-bold text-base text-dim transition-transform duration-300"
                    style={{ transform: expanded === p.id ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </span>
                </div>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ gridTemplateRows: expanded === p.id ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-line px-[22px] py-[18px] bg-[#0a1a29]">
                    <div className="font-semibold text-xs text-dim mb-1.5">Merkle Root</div>
                    <div className="font-mono font-medium text-[13px] text-muted mb-3.5 break-all">{p.root}</div>
                    <div className="font-semibold text-xs text-dim mb-1.5">Solana Signature</div>
                    <div className="font-mono font-medium text-[13px] text-muted break-all">{p.sig}</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
