import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import type { Project, PaginationMetadata } from "@/lib/types";

export interface ProjectsParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}

export interface ProjectsResult {
  data: Project[];
  metadata: PaginationMetadata;
}

async function fetchProjects(
  params: ProjectsParams = {},
): Promise<ProjectsResult> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "all")
    search.set("status", params.status);
  const res = await fetch(`/api/projects?${search}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export function projectsQueryOptions(params: ProjectsParams = {}) {
  return queryOptions({
    queryKey: queryKeys.projects(params),
    queryFn: () => fetchProjects(params),
    staleTime: 60 * 1000,
  });
}
