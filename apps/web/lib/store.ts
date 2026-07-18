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
  bets: [],
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
