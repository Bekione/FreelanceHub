"use server";

import { getMetrics } from "@/lib/server/dashboard";
import { getClients } from "@/lib/server/clients";
import { getProjects } from "@/lib/server/projects";
import { getInvoices } from "@/lib/server/invoices";
import type { ClientsParams } from "@/lib/server/clients";
import type { ProjectsParams } from "@/lib/server/projects";
import type { InvoicesParams } from "@/lib/server/invoices";

export async function getDashboardMetrics() {
  return getMetrics();
}

export async function fetchClients(params: ClientsParams = {}) {
  return getClients(params);
}

export async function fetchProjects(params: ProjectsParams = {}) {
  return getProjects(params);
}

export async function fetchInvoices(params: InvoicesParams = {}) {
  return getInvoices(params);
}
