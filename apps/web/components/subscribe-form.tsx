"use client";

import { useState } from "react";

function SentTick() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div
        className="w-[64px] h-[64px] rounded-full bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.5)] flex items-center justify-center"
        style={{ animation: "tickpop 0.45s cubic-bezier(0.22,1,0.36,1) forwards" }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5L10 17.5L19 7"
            stroke="#4ade80"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: "tickdraw 0.4s ease 0.25s forwards" }}
          />
        </svg>
      </div>
      <div className="font-heading font-bold text-[15px] text-fg">You&apos;re in the ocean! 🐋</div>
      <div className="font-medium text-[12px] text-dim">Check your inbox for a confirmation.</div>
    </div>
  );
}

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const openModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("idle");
    setModalOpen(true);
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status === "sending" || status === "done") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message: message.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setTimeout(() => {
        setModalOpen(false);
        setEmail("");
        setMessage("");
      }, 2200);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <form onSubmit={openModal} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 min-w-0 px-3.5 py-[11px] rounded-lg border border-line-3 bg-[#0a1624] text-fg font-medium text-[13px]"
        />
        <button
          type="submit"
          className="bg-accent border-none text-white font-heading font-bold text-[13px] px-4 py-[11px] rounded-lg cursor-pointer hover:bg-accent-soft transition-colors"
        >
          →
        </button>
      </form>

      {modalOpen && (
        <div className="fixed inset-0 z-[300] bg-[rgba(4,9,15,0.75)] flex items-center justify-center px-4">
          <div className="rise-in w-full max-w-[380px] bg-[#0a0f16] border border-[#1c2937] rounded-[10px] p-6 box-border relative" style={{ animationDuration: "0.35s" }}>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-[18px] bg-transparent border-none text-dim text-lg cursor-pointer leading-none"
            >
              ×
            </button>
            {status === "done" ? (
              <SentTick />
            ) : (
              <form onSubmit={send}>
                <div className="font-heading font-bold text-[11px] tracking-[1.5px] text-dim mb-4">BLUEFIN</div>
                <div className="font-heading font-bold text-[20px] text-fg mb-1.5">Almost there</div>
                <div className="font-semibold text-[11px] tracking-[1px] text-dim mb-4 uppercase">{email}</div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Anything you'd like to tell us? (optional)"
                  rows={3}
                  maxLength={1000}
                  className="w-full box-border resize-none px-3.5 py-3 rounded-lg border border-[#1c2937] bg-[#0a1624] text-fg font-medium text-[13px] mb-4 focus:border-[#2f5fa8] outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-accent border-none text-white font-heading font-bold text-[13px] py-3 rounded-lg cursor-pointer hover:bg-accent-soft transition-colors disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Send"}
                </button>
                {status === "error" && (
                  <div className="mt-2.5 text-center font-semibold text-[12px] text-no">Something went wrong — try again</div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
