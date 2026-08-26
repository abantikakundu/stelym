"use client";

import { useState } from "react";
import { Plugs, SignOut, Wallet, SpinnerGap } from "@phosphor-icons/react";
import { Button } from "@/components/Button";
import { useFreighter } from "@/hooks/useFreighter";
import { shortenAddress } from "@/lib/stellar";

export function WalletButton() {
  const {
    connected,
    address,
    network,
    installed,
    loading,
    connect,
    disconnect,
  } = useFreighter();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <Button variant="secondary" disabled>
        <SpinnerGap className="size-4 animate-spin" weight="bold" />
        Wallet
      </Button>
    );
  }

  if (!installed) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 border-[2.5px] border-ink bg-mint px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[4px_4px_0_0_#111111] dark:shadow-[4px_4px_0_0_#000000] transition-[transform,box-shadow] duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111111] dark:hover:shadow-[2px_2px_0_0_#000000]"
      >
        <Plugs className="size-4" weight="bold" />
        Install Freighter
      </a>
    );
  }

  if (connected && address) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="nb-card-mint px-3 py-2 text-right text-xs">
          <p className="flex items-center justify-end gap-1 font-extrabold uppercase">
            <Wallet className="size-3.5" weight="bold" />
            Connected
          </p>
          <p className="font-mono">{shortenAddress(address)}</p>
          <p className="uppercase">{network ?? "testnet"}</p>
        </div>
        <Button variant="secondary" onClick={disconnect}>
          <SignOut className="size-4" weight="bold" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="success" onClick={handleConnect} disabled={connecting}>
        {connecting ? (
          <SpinnerGap className="size-4 animate-spin" weight="bold" />
        ) : (
          <Wallet className="size-4" weight="bold" />
        )}
        {connecting ? "Connecting" : "Connect Wallet"}
      </Button>
      {error && <p className="max-w-xs text-right text-xs font-bold">{error}</p>}
    </div>
  );
}
