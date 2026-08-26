"use client";

import { LockSimple } from "@phosphor-icons/react";
import { useFreighter } from "@/hooks/useFreighter";

export function WalletRequiredBanner() {
  const { connected, loading } = useFreighter();

  if (loading || connected) {
    return null;
  }

  return (
    <div className="nb-card-punch px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center border-[2px] border-ink bg-white text-punch shadow-[2px_2px_0_0_#111111] dark:bg-[#131927] dark:text-[#818cf8] dark:shadow-[2px_2px_0_0_#000000]">
          <LockSimple className="size-5" weight="bold" />
        </span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide">
            Wallet required for writes
          </p>
          <p className="mt-0.5 text-xs text-white/90 dark:text-slate-300">
            Connect Freighter using the button above to create a project, send a tip, or withdraw. Viewing projects works without a wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
