import Link from "next/link";

export default function Footer() {
  return (
    <div className="relative border-t border-line-3 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover"
        style={{ backgroundImage: "url('/assets/whale-tail-fish.jpg')", backgroundPosition: "center 30%" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,14,24,0.88)_0%,rgba(6,14,24,0.96)_40%,#060e18_100%)]" />
      <div className="relative max-w-[1280px] mx-auto px-10 pt-16 pb-7">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr] gap-9 pb-11 border-b border-line-3">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <img src="/assets/bluefin-orca.svg" alt="Bluefin" className="w-[30px] h-[30px] object-contain orca-tint" />
              <span className="font-heading font-bold text-[15px] tracking-[3px] text-fg">BLUEFIN</span>
            </div>
            <div className="font-semibold text-[13px] text-accent-soft mb-2.5">Ride the Waves of Chance.</div>
            <div className="font-semibold text-[13px] text-accent-soft mb-2.5">Trade the Game. Trust the Outcome.</div>
            <div className="font-medium text-[13px] leading-relaxed text-dim">
              Bluefin is a decentralized prediction market protocol for sports and real-world events. Trade with
              confidence. Settled on-chain.
            </div>
          </div>
          <div>
            <div className="font-bold text-[13px] text-fg mb-3.5">Markets</div>
            <div className="flex flex-col gap-[9px] font-medium text-[13px] text-dim">
              <Link href="/markets" className="text-dim no-underline hover:text-accent-soft">All Markets</Link>
              <Link href="/trade/arg-fra" className="text-dim no-underline hover:text-accent-soft">Live Now</Link>
              <Link href="/markets" className="text-dim no-underline hover:text-accent-soft">World Cup 2026</Link>
              <Link href="/markets" className="text-dim no-underline hover:text-accent-soft">Football</Link>
            </div>
          </div>
          <div>
            <div className="font-bold text-[13px] text-fg mb-3.5">Learn</div>
            <div className="flex flex-col gap-[9px] font-medium text-[13px] text-dim">
              <Link href="/#how-it-works" className="text-dim no-underline hover:text-accent-soft">How It Works</Link>
              <Link href="/proofs" className="text-dim no-underline hover:text-accent-soft">Proofs & Settlement</Link>
              <span className="cursor-pointer">Docs</span>
              <span className="cursor-pointer">API</span>
            </div>
          </div>
          <div>
            <div className="font-bold text-[13px] text-fg mb-3.5">Legal</div>
            <div className="flex flex-col gap-[9px] font-medium text-[13px] text-dim">
              <span className="cursor-pointer">Terms of Service</span>
              <span className="cursor-pointer">Privacy Policy</span>
              <span className="cursor-pointer">Risk Disclaimer</span>
              <span className="cursor-pointer">Compliance</span>
            </div>
          </div>
          <div>
            <div className="font-bold text-[13px] text-fg mb-3.5">Stay in the Ocean</div>
            <div className="font-medium text-[13px] text-dim mb-3">Get market updates and protocol news.</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-3.5 py-[11px] rounded-lg border border-line-3 bg-[#0a1624] text-fg font-medium text-[13px]"
              />
              <button className="bg-accent border-none text-white font-heading font-bold text-[13px] px-4 py-[11px] rounded-lg cursor-pointer">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="pt-[22px] text-center font-medium text-xs text-faint">
          © 2026 Bluefin. All rights reserved. · Powered by TxODDS · TxLINE
        </div>
      </div>
    </div>
  );
}
