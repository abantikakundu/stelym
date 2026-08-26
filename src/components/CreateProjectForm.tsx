"use client";

import { FormEvent, useState } from "react";
import { FolderPlus, LockSimple, PlusCircle } from "@phosphor-icons/react";
import { Button } from "@/components/Button";
import { useFreighter } from "@/hooks/useFreighter";

interface CreateProjectFormProps {
  onSubmit: (form: { name: string; description: string }) => Promise<bigint>;
  loading: boolean;
}

export function CreateProjectForm({ onSubmit, loading }: CreateProjectFormProps) {
  const { connected } = useFreighter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setAuthError(null);

    if (!connected) {
      setAuthError("Please connect your wallet before creating a project.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Project name is required");
      return;
    }
    if (trimmedName.length > 64) {
      setError("Name must be 64 characters or fewer");
      return;
    }
    if (description.trim().length > 280) {
      setError("Description must be 280 characters or fewer");
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
      });
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  return (
    <section className="nb-card relative p-5">
      {!connected && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/20 dark:bg-black/25" />
      )}

      <div className={connected ? "" : "opacity-85"}>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center border-[3px] border-ink bg-punch text-white">
            <FolderPlus className="size-5" weight="bold" />
          </span>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Create Project</h2>
            {!connected && (
              <span className="nb-chip mt-1 bg-punch text-white">
                <LockSimple className="size-3" weight="bold" />
                Login
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Register a project to receive XLM tips in escrow until you withdraw.
        </p>

        <form onSubmit={handleSubmit} className="relative z-20 mt-6 space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-extrabold uppercase tracking-wide">
              Name
            </label>
            <input
              id="name"
              type="text"
              maxLength={64}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="nb-field"
              placeholder="Harbor Lights"
              disabled={loading || !connected}
              readOnly={!connected}
            />
            <p className="text-xs text-ink/55">Up to 64 characters.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-xs font-extrabold uppercase tracking-wide">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={280}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="nb-field resize-none"
              placeholder="What are people supporting?"
              disabled={loading || !connected}
              readOnly={!connected}
            />
            <p className="text-xs text-ink/55">Optional. Up to 280 characters.</p>
          </div>

          {authError && (
            <p className="nb-card bg-white px-3 py-2 text-sm font-bold">{authError}</p>
          )}

          {error && <p className="text-sm font-bold">{error}</p>}

          <Button
            type="submit"
            variant={connected ? "primary" : "secondary"}
            disabled={loading}
            className="w-full"
            onClick={() => {
              if (!connected) {
                setAuthError("Please connect your wallet before creating a project.");
              }
            }}
          >
            <PlusCircle className="size-4" weight="bold" />
            {loading
              ? "Creating..."
              : connected
                ? "Create Project"
                : "Connect wallet to create"}
          </Button>
        </form>
      </div>
    </section>
  );
}
