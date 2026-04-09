import { Suspense } from "react";
import type { Metadata } from "next";
import { ProjectsContent } from "./projects-client";
import { ProjectsSkeleton } from "./projects-skeleton";

export const metadata: Metadata = {
  title: "Projects | FreelanceHub",
  description:
    "Manage your client projects, track deadlines, and monitor budgets.",
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsContent />
    </Suspense>
  );
}
