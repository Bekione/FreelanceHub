import { Suspense } from "react";
import type { Metadata } from "next";
import { getProjects } from "@/lib/server/projects";
import { ProjectsContent } from "./projects-client";
import { ProjectsSkeleton } from "./projects-skeleton";
import type { ProjectsResult } from "@/lib/queries/projects";

export const metadata: Metadata = {
  title: "Projects | FreelanceHub",
  description:
    "Manage your client projects, track deadlines, and monitor budgets.",
};

export default async function ProjectsPage() {
  let initialData: ProjectsResult | null = null;
  try {
    initialData = (await getProjects({})) as unknown as ProjectsResult;
  } catch {
    // Client will fetch via /api/projects
  }

  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsContent initialData={initialData} />
    </Suspense>
  );
}
