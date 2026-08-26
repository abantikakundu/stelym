"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createProject as createProjectOnChain,
  fetchProject,
  fetchBalance,
  fetchProjectsWithBalances,
  fetchTips,
  sendTip,
  withdrawBalance,
  type Project,
  type Tip,
} from "@/lib/contract";
import { useFreighter } from "@/hooks/useFreighter";
import { xlmToStroops } from "@/lib/stellar";

export type ProjectRow = Project & { balance: bigint };

export function useProjectList() {
  const { address, connected, sign } = useFreighter();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchProjectsWithBalances();
      setProjects(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProjects();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProjects]);

  const createProject = useCallback(
    async (form: { name: string; description: string }) => {
      if (!connected || !address) {
        throw new Error("Connect your Freighter wallet first");
      }

      setActionLoading(true);
      setError(null);
      setMessage(null);

      try {
        const id = await createProjectOnChain(address, sign, {
          name: form.name.trim(),
          description: form.description.trim(),
        });
        setMessage("Project created");
        return id;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to create project";
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [address, connected, sign],
  );

  const clearFeedback = useCallback(() => {
    setError(null);
    setMessage(null);
  }, []);

  return {
    projects,
    loading,
    actionLoading,
    error,
    message,
    loadProjects,
    createProject,
    clearFeedback,
  };
}

export function useProjectDetail(projectIdParam: string | undefined) {
  const { address, connected, sign } = useFreighter();
  const [project, setProject] = useState<Project | null>(null);
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const projectId = parseProjectId(projectIdParam);

  const load = useCallback(async () => {
    if (projectId === null) {
      setNotFound(true);
      setLoading(false);
      setProject(null);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const [loaded, loadedBalance, loadedTips] = await Promise.all([
        fetchProject(projectId),
        fetchBalance(projectId),
        fetchTips(projectId),
      ]);
      setProject(loaded);
      setBalance(loadedBalance);
      setTips([...loadedTips].reverse());
    } catch {
      setNotFound(true);
      setProject(null);
      setTips([]);
      setBalance(BigInt(0));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const tip = useCallback(
    async (form: { amount: string; message: string }) => {
      if (!connected || !address) {
        throw new Error("Connect your Freighter wallet first");
      }
      if (projectId === null) {
        throw new Error("Project not found");
      }

      setActionLoading(true);
      setError(null);
      setMessage(null);

      try {
        await sendTip(address, sign, {
          projectId,
          amount: xlmToStroops(form.amount),
          message: form.message.trim(),
        });
        setMessage("Tip sent");
        await load();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to send tip";
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [address, connected, load, projectId, sign],
  );

  const withdraw = useCallback(async () => {
    if (!connected || !address) {
      throw new Error("Connect your Freighter wallet first");
    }
    if (projectId === null) {
      throw new Error("Project not found");
    }

    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      await withdrawBalance(address, sign, projectId);
      setMessage("Withdraw complete. 99% went to you and 1% to the platform.");
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to withdraw";
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [address, connected, load, projectId, sign]);

  const clearFeedback = useCallback(() => {
    setError(null);
    setMessage(null);
  }, []);

  const lifetimeTipped = tips.reduce((sum, item) => sum + item.amount, BigInt(0));
  const isOwner = Boolean(address && project && address === project.owner);

  return {
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
    load,
    tip,
    withdraw,
    clearFeedback,
  };
}

function parseProjectId(value: string | undefined): bigint | null {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}
