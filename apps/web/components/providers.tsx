"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";
import { useAppStore } from "@/lib/store";

function WalletSync({ children }: { children: React.ReactNode }) {
  const { publicKey, connected } = useWallet();
  const setWallet = useAppStore((s) => s.setWallet);
  const disconnect = useAppStore((s) => s.disconnect);

  useEffect(() => {
    if (connected && publicKey) {
      const addr = publicKey.toBase58();
      setWallet(`${addr.slice(0, 4)}...${addr.slice(-4)}`);
    } else {
      disconnect();
    }
  }, [connected, publicKey, setWallet, disconnect]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [wallets] = useState(() => [new PhantomWalletAdapter()]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
        {/* onError: user closing the wallet popup is not an app error; the modal
            already shows a toast for it, so keep it out of the console */}
        <WalletProvider wallets={wallets} autoConnect onError={() => {}}>
          <WalletSync>{children}</WalletSync>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}
