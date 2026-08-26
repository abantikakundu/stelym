"use client";

import { ProjectDetail } from "@/components/ProjectDetail";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  return <ProjectDetail projectId={params?.id} />;
}
