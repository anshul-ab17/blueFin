import Link from "next/link";
import SubscribeForm from "@/components/subscribe-form";

export default function Footer() {
  return (
    <div className="relative border-t border-line-3 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover"
        style={{ backgroundImage: "url('/assets/whale-tail-fish.jpg')", backgroundPosition: "center 30%" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,14,24,0.88)_0%,rgba(6,14,24,0.96)_40%,#060e18_100%)]" />
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-10 pt-16 pb-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-9 pb-11 border-b border-line-3">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <img src="/assets/bluefin-orca.svg" alt="Bluefin" className="w-[30px] h-[30px] object-contain orca-tint" />
              <span className="font-heading font-bold text-[15px] tracking-[3px] text-fg">BLUEFIN</span>
            </div>
            <div className="font-semibold text-[13px] text-accent-soft mb-2.5">Trade the Game. Trust the Outcome.</div>
            <div className="font-medium text-[13px] leading-relaxed text-dim">
              Bluefin is a decentralized prediction market protocol for sports and real-world events. Trade with
              confidence. Settled on-chain.
            </div>
            <div className="flex items-center gap-3.5 mt-4">
              <a href="https://github.com/anshul-ab17" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-dim hover:text-accent-soft">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/anshul-bt17" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-dim hover:text-accent-soft">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z"/>
                </svg>
              </a>
              <a href="https://x.com/anshul_ab17" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-dim hover:text-accent-soft">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.22-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64Z"/>
                </svg>
              </a>
              <a href="https://discord.com/users/891385987048034344" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="text-dim hover:text-accent-soft">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.6 1.25a18.27 18.27 0 0 0-5.49 0 12.6 12.6 0 0 0-.61-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06c0 .02.01.04.03.05a19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.22-2a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13c.13-.09.25-.19.37-.29a.07.07 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08.01c.12.1.25.2.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.64-1.87.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.22 2a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6-3.03.08.08 0 0 0 .04-.05c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42s.95-2.42 2.15-2.42c1.22 0 2.18 1.1 2.16 2.42 0 1.34-.94 2.42-2.16 2.42Z"/>
                </svg>
              </a>
              <a href="https://anshulbharat.com" target="_blank" rel="noopener noreferrer" aria-label="Website" className="text-dim hover:text-accent-soft">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3Z" />
                </svg>
              </a>
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
              <Link href="/docs" className="text-dim no-underline hover:text-accent-soft">Docs</Link>
            </div>
          </div>
          <div>
            <div className="font-bold text-[13px] text-fg mb-3.5">Stay in the Ocean</div>
            <div className="font-medium text-[13px] text-dim mb-3">Get market updates and protocol news.</div>
            <SubscribeForm />
          </div>
        </div>
        <div className="pt-[22px] text-center font-medium text-xs text-faint">
          © 2026 Bluefin. All rights reserved. · Powered by TxODDS · TxLINE
        </div>
      </div>
    </div>
  );
}
