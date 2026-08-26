"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bank,
  ChatCircleText,
  ClockCounterClockwise,
  Coins,
  HandCoins,
  LockSimple,
  MagnifyingGlass,
  User,
  Vault,
} from "@phosphor-icons/react";
import { Button } from "@/components/Button";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { useFreighter } from "@/hooks/useFreighter";
import { useProjectDetail } from "@/hooks/useTipping";
import { formatTimestamp, formatXlm, shortenAddress } from "@/lib/stellar";

interface ProjectDetailProps {
  projectId: string | undefined;
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const {
    project,
    balance,
    tips,
    lifetimeTipped,
    isOwner,
    loading,
    actionLoading,
    notFound,
    error,
    message,
    tip,
    withdraw,
    clearFeedback,
  } = useProjectDetail(projectId);
  const { connected } = useFreighter();
  const [amount, setAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleTip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setAuthError(null);

    if (!connected) {
      setAuthError("Please connect your wallet before sending a tip.");
      return;
    }

    if (tipMessage.trim().length > 280) {
      setFormError("Message must be 280 characters or fewer");
      return;
    }

    try {
      await tip({ amount, message: tipMessage });
      setAmount("");
      setTipMessage("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to send tip");
    }
  };

  const handleWithdraw = async () => {
    setAuthError(null);
    if (!connected) {
      setAuthError("Please connect your wallet before withdrawing.");
      return;
    }
    if (
      !confirm("Withdraw sends 99% to you and 1% to the platform. Continue?")
    ) {
      return;
    }
    try {
      await withdraw();
    } catch {
      // error banner is set in the hook
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40 border-[3px] border-ink bg-paper" />
        <div className="h-40 border-[3px] border-ink bg-white shadow-[6px_6px_0_0_#111111]" />
        <div className="h-64 border-[3px] border-ink bg-white shadow-[6px_6px_0_0_#111111]" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="nb-card bg-white px-6 py-16 text-center">
        <MagnifyingGlass className="mx-auto size-10" weight="bold" />
        <p className="mt-4 text-lg font-black uppercase">Project not found</p>
        <p className="mt-2 text-sm text-ink/70">
          This project id does not exist on the contract.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 border-[3px] border-ink bg-punch px-4 py-2 text-sm font-extrabold uppercase text-white shadow-[5px_5px_0_0_#111111]"
        >
          <ArrowLeft className="size-4" weight="bold" />
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide hover:text-punch"
      >
        <ArrowLeft className="size-4" weight="bold" />
        Back to projects
      </Link>

      <FeedbackBanner error={error} message={message} onDismiss={clearFeedback} />

      <section className="nb-card bg-white p-5">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <p className="nb-chip bg-punch text-white">Project {project.id.toString()}</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight">{project.name}</h2>
            {project.description ? (
              <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-ink/75">
                {project.description}
              </p>
            ) : null}
            <p className="mt-4 flex items-center gap-2 font-mono text-xs text-ink/60">
              <User className="size-4" weight="bold" />
              {shortenAddress(project.owner)}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="nb-card-punch px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
                <Vault className="size-4" weight="bold" />
                Escrowed
              </p>
              <p className="mt-1 font-mono text-2xl font-bold">{formatXlm(balance)}</p>
            </div>
            <div className="nb-card-mint px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
                <Coins className="size-4" weight="bold" />
                Lifetime tipped
              </p>
              <p className="mt-1 font-mono text-lg font-bold">{formatXlm(lifetimeTipped)}</p>
            </div>
            {isOwner && (
              <Button
                variant="success"
                onClick={() => void handleWithdraw()}
                disabled={actionLoading || balance === BigInt(0)}
                className="w-full"
              >
                <Bank className="size-4" weight="bold" />
                {actionLoading ? "Working..." : "Withdraw"}
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="nb-card relative p-5">
          {!connected && (
            <div className="pointer-events-none absolute inset-0 z-10 bg-white/20 dark:bg-black/25" />
          )}
          <div className={connected ? "" : "opacity-85"}>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center border-[3px] border-ink bg-mint text-white">
                <HandCoins className="size-5" weight="bold" />
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight">Send a tip</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              XLM stays in the contract until the owner withdraws. 1% platform fee
              is taken then.
            </p>
            <form onSubmit={handleTip} className="relative z-20 mt-6 space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="amount" className="text-xs font-extrabold uppercase tracking-wide">
                  Amount (XLM)
                </label>
                <input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="nb-field"
                  placeholder="1.5"
                  disabled={actionLoading || !connected}
                  readOnly={!connected}
                />
                <p className="text-xs text-ink/55">Up to 7 decimal places.</p>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs font-extrabold uppercase tracking-wide">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={3}
                  maxLength={280}
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  className="nb-field resize-none"
                  placeholder="Optional public note"
                  disabled={actionLoading || !connected}
                  readOnly={!connected}
                />
              </div>
              {authError && (
                <p className="nb-card flex items-center gap-2 bg-white px-3 py-2 text-sm font-bold">
                  <LockSimple className="size-4" weight="bold" />
                  {authError}
                </p>
              )}
              {formError && <p className="text-sm font-bold">{formError}</p>}
              <Button
                type="submit"
                variant={connected ? "success" : "secondary"}
                disabled={actionLoading}
                className="w-full"
              >
                <HandCoins className="size-4" weight="bold" />
                {actionLoading
                  ? "Sending..."
                  : connected
                    ? "Tip"
                    : "Connect wallet to tip"}
              </Button>
            </form>
          </div>
        </section>

        <section className="nb-card bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center border-[3px] border-ink bg-punch text-white">
              <ClockCounterClockwise className="size-5" weight="bold" />
            </span>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Tip history</h3>
              <p className="text-sm text-ink/70">Newest first. History stays after withdraw.</p>
            </div>
          </div>
          {tips.length === 0 ? (
            <div className="mt-8 border-[3px] border-dashed border-ink py-12 text-center">
              <ChatCircleText className="mx-auto size-8" weight="bold" />
              <p className="mt-3 text-sm font-bold uppercase">No tips yet.</p>
            </div>
          ) : (
            <ul className="mt-6 grid gap-3">
              {tips.map((item) => (
                <li key={item.id.toString()} className="border-[3px] border-ink bg-paper px-4 py-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="flex items-center gap-1 font-mono text-sm font-bold">
                      <Coins className="size-4 text-mint" weight="bold" />
                      {formatXlm(item.amount)}
                    </p>
                    <p className="text-xs font-bold uppercase text-ink/55">
                      {formatTimestamp(item.timestamp)}
                    </p>
                  </div>
                  <p className="mt-1 flex items-center gap-1 font-mono text-xs text-ink/60">
                    <User className="size-3.5" weight="bold" />
                    {shortenAddress(item.from)}
                  </p>
                  {item.message ? (
                    <p className="mt-2 flex items-start gap-2 max-w-[65ch] text-sm leading-relaxed">
                      <ChatCircleText className="mt-0.5 size-4 shrink-0" weight="bold" />
                      {item.message}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
