"use server";

import { getMetrics } from "@/lib/server/dashboard";
import { getClients, type ClientsParams } from "@/lib/server/clients";
import { getProjects, type ProjectsParams } from "@/lib/server/projects";
import { getInvoices, type InvoicesParams } from "@/lib/server/invoices";

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
