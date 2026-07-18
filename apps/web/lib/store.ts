import { create } from "zustand";
import type { Bet } from "@bluefin/types";

interface AppState {
  walletConnected: boolean;
  walletAddress: string;
  authOpen: boolean;
  bets: Bet[];
  toast: string | null;
  openAuth: () => void;
  closeAuth: () => void;
  setWallet: (address: string) => void;
  disconnect: () => void;
  placeBet: (bet: Omit<Bet, "id" | "payout">) => void;
  flashToast: (msg: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useAppStore = create<AppState>((set) => ({
  walletConnected: false,
  walletAddress: "",
  authOpen: false,
  bets: [
    { id: 1, event: "Argentina vs France", category: "Match Result", outcome: "Argentina", side: "YES", stake: 120, odds: 1.48, payout: 177.6 },
    { id: 2, event: "Brazil vs Germany", category: "Total Goals", outcome: "Under 2.5", side: "NO", stake: 60, odds: 1.62, payout: 97.2 },
  ],
  toast: null,
  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
  setWallet: (address) => set({ walletConnected: true, authOpen: false, walletAddress: address }),
  disconnect: () => set({ walletConnected: false, walletAddress: "" }),
  placeBet: (bet) =>
    set((s) => ({
      bets: [{ ...bet, id: Date.now(), payout: bet.stake * bet.odds }, ...s.bets],
    })),
  flashToast: (msg) => {
    set({ toast: msg });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 2500);
  },
}));
