"use client";

import { useRouter } from "next/navigation";
import { Cube } from "@phosphor-icons/react";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { ProjectList } from "@/components/ProjectList";
import { WalletRequiredBanner } from "@/components/WalletRequiredBanner";
import { useProjectList } from "@/hooks/useTipping";
import { CONTRACT_ID } from "@/lib/stellar";

export function TippingApp() {
  const router = useRouter();
  const {
    projects,
    loading,
    actionLoading,
    error,
    message,
    loadProjects,
    createProject,
    clearFeedback,
  } = useProjectList();

  return (
    <div className="space-y-6">
      <WalletRequiredBanner />
      <FeedbackBanner error={error} message={message} onDismiss={clearFeedback} />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <CreateProjectForm
          loading={actionLoading}
          onSubmit={async (form) => {
            const id = await createProject(form);
            router.push(`/projects/${id.toString()}`);
            return id;
          }}
        />
        <ProjectList
          projects={projects}
          loading={loading}
          onRefresh={() => {
            void loadProjects();
          }}
        />
      </div>

      <p className="flex items-center justify-center gap-2 font-mono text-xs text-ink/50">
        <Cube className="size-3.5" weight="bold" />
        {CONTRACT_ID}
      </p>
    </div>
  );
}
