import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchProjects } from "@/lib/actions";
import type { ProjectsParams } from "@/lib/server/projects";

export function projectsQueryOptions(params: ProjectsParams = {}) {
  return queryOptions({
    queryKey: queryKeys.projects(params),
    queryFn: () => fetchProjects(params),
    staleTime: 60 * 1000,
  });
}
