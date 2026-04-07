import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { projectsQueryOptions } from "@/lib/queries/projects";
import { getProjects } from "@/lib/server/projects";
import { ProjectsContent } from "./projects-client";
import { ProjectsSkeleton } from "./projects-skeleton";

export const metadata: Metadata = {
  title: "Projects | FreelanceHub",
  description:
    "Manage your client projects, track deadlines, and monitor budgets.",
};

export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  await queryClient
    .prefetchQuery({
      ...projectsQueryOptions(),
      queryFn: () => getProjects({}),
    })
    .catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </HydrationBoundary>
  );
}
