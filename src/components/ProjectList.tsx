"use client";

import Link from "next/link";
import { ArrowsClockwise, Coins, Stack, User } from "@phosphor-icons/react";
import { Button } from "@/components/Button";
import type { ProjectRow } from "@/hooks/useTipping";
import { formatXlm, shortenAddress } from "@/lib/stellar";

interface ProjectListProps {
  projects: ProjectRow[];
  loading: boolean;
  onRefresh: () => void;
}

export function ProjectList({ projects, loading, onRefresh }: ProjectListProps) {
  return (
    <section className="nb-card bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center border-[3px] border-ink bg-mint text-white">
            <Stack className="size-5" weight="bold" />
          </span>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Projects</h2>
            <p className="mt-1 text-sm text-ink/70">
              Balances come from the contract. Click a project to tip.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={onRefresh} disabled={loading}>
          <ArrowsClockwise className={`size-4 ${loading ? "animate-spin" : ""}`} weight="bold" />
          {loading ? "Loading" : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          <div className="h-16 border-[3px] border-ink bg-paper" />
          <div className="h-16 border-[3px] border-ink bg-paper" />
          <div className="h-16 border-[3px] border-ink bg-paper" />
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8 border-[3px] border-dashed border-ink py-12 text-center">
          <Stack className="mx-auto size-8 text-ink" weight="bold" />
          <p className="mt-3 text-sm font-bold uppercase">No projects yet.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {projects.map((project) => (
            <li key={project.id.toString()}>
              <Link
                href={`/projects/${project.id.toString()}`}
                className="nb-card flex items-center justify-between gap-4 bg-white px-4 py-3 transition-[transform,box-shadow] duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#111111]"
              >
                <div className="min-w-0">
                  <p className="font-extrabold uppercase tracking-tight">{project.name}</p>
                  <p className="mt-1 flex items-center gap-1 font-mono text-xs text-ink/60">
                    <User className="size-3.5" weight="bold" />
                    {shortenAddress(project.owner)}
                  </p>
                </div>
                <p className="flex shrink-0 items-center gap-1 font-mono text-sm font-bold">
                  <Coins className="size-4 text-mint" weight="bold" />
                  {formatXlm(project.balance)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
