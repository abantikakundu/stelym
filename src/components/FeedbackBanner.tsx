"use client";

import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";

interface FeedbackBannerProps {
  error?: string | null;
  message?: string | null;
  onDismiss: () => void;
}

export function FeedbackBanner({ error, message, onDismiss }: FeedbackBannerProps) {
  if (!error && !message) return null;

  const isError = Boolean(error);

  return (
    <div
      className={`nb-card flex items-start justify-between gap-4 px-4 py-3 text-sm font-medium ${
        isError ? "bg-white" : "bg-mint text-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <WarningCircle className="mt-0.5 size-5 shrink-0" weight="bold" />
        ) : (
          <CheckCircle className="mt-0.5 size-5 shrink-0" weight="bold" />
        )}
        <p>{error ?? message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="inline-flex size-8 shrink-0 items-center justify-center border-[3px] border-ink bg-white text-ink"
        aria-label="Dismiss"
      >
        <X className="size-4" weight="bold" />
      </button>
    </div>
  );
}
