import { create } from "zustand";

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  _count?: { projects: number; invoices: number };
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  deadline: string | null;
  budget: number | null;
  bonus: number | null;
  platform: string | null;
  clientId: string | null;
  client: { id: string; name: string; company: string | null } | null;
  createdAt: string;
  _count?: { invoices: number };
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  bonus: number | null;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  issueDate: string;
  dueDate: string;
  notes: string | null;
  clientId: string | null;
  projectId: string | null;
  client: { id: string; name: string; company: string | null } | null;
  project: { id: string; title: string } | null;
  items: InvoiceItem[];
  createdAt: string;
}

export interface PaginationMetadata {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  activeProjects: number;
  totalProjects: number;
  pendingInvoicesCount: number;
  pendingInvoicesAmount: number;
  totalClients: number;
  recentActivity: Array<{
    type: "invoice" | "project";
    label: string;
    sub: string;
    status: string;
    date: string;
  }>;
}

// ─── Store Definitions ────────────────────────────────────────────────────────

interface ClientsState {
  clients: Client[];
  clientsMeta: PaginationMetadata | null;
  isLoadingClients: boolean;
  clientsError: string | null;
  fetchClients: (params?: {
    page?: number;
    limit?: number;
    q?: string;
  }) => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<{ error?: string }>;
  updateClient: (
    id: string,
    data: Partial<Client>,
  ) => Promise<{ error?: string }>;
  deleteClient: (id: string) => Promise<{ error?: string }>;
}

interface ProjectsState {
  projects: Project[];
  projectsMeta: PaginationMetadata | null;
  isLoadingProjects: boolean;
  projectsError: string | null;
  fetchProjects: (params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
  }) => Promise<void>;
  createProject: (
    data: Partial<Project> & { clientId?: string },
  ) => Promise<{ error?: string }>;
  updateProject: (
    id: string,
    data: Partial<Project>,
  ) => Promise<{ error?: string }>;
  deleteProject: (id: string) => Promise<{ error?: string }>;
}

interface InvoicesState {
  invoices: Invoice[];
  invoicesMeta: PaginationMetadata | null;
  isLoadingInvoices: boolean;
  invoicesError: string | null;
  fetchInvoices: (params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
  }) => Promise<void>;
  createInvoice: (
    data: Partial<Invoice> & { items?: Partial<InvoiceItem>[] },
  ) => Promise<{ error?: string }>;
  updateInvoice: (
    id: string,
    data: Partial<Invoice>,
  ) => Promise<{ error?: string }>;
  deleteInvoice: (id: string) => Promise<{ error?: string }>;
  markInvoicePaid: (id: string) => Promise<{ error?: string }>;
}

interface MetricsState {
  dashboardMetrics: DashboardMetrics | null;
  isLoadingMetrics: boolean;
  fetchMetrics: () => Promise<void>;
}

type DataState = ClientsState & ProjectsState & InvoicesState & MetricsState;

// ─── Store Implementation ─────────────────────────────────────────────────────

export const useDataStore = create<DataState>((set, get) => ({
  // ── Clients ──
  clients: [],
  clientsMeta: null,
  isLoadingClients: true,
  clientsError: null,

  fetchClients: async (params = {}) => {
    // Only show loading skeleton on first fetch (data not yet loaded)
    const alreadyLoaded = get().clients.length > 0;
    if (!alreadyLoaded) set({ isLoadingClients: true, clientsError: null });
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.q) searchParams.set("q", params.q);

      const res = await fetch(`/api/clients?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch clients");
      const { data, metadata } = await res.json();
      set({ clients: data, clientsMeta: metadata });
    } catch (e) {
      set({ clientsError: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      set({ isLoadingClients: false });
    }
  },

  createClient: async (data) => {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to create client" };
    set((s) => ({ clients: [json, ...s.clients] }));
    get().fetchMetrics();
    return {};
  },

  updateClient: async (id, data) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to update client" };
    set((s) => ({ clients: s.clients.map((c) => (c.id === id ? json : c)) }));
    get().fetchMetrics();
    return {};
  },

  deleteClient: async (id) => {
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to delete client" };
    set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }));
    get().fetchMetrics();
    return {};
  },

  // ── Projects ──
  projects: [],
  projectsMeta: null,
  isLoadingProjects: true,
  projectsError: null,

  fetchProjects: async (params = {}) => {
    const alreadyLoaded = get().projects.length > 0;
    if (!alreadyLoaded) set({ isLoadingProjects: true, projectsError: null });
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.q) searchParams.set("q", params.q);
      if (params.status && params.status !== "all")
        searchParams.set("status", params.status);

      const res = await fetch(`/api/projects?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      const { data, metadata } = await res.json();
      set({ projects: data, projectsMeta: metadata });
    } catch (e) {
      set({ projectsError: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      set({ isLoadingProjects: false });
    }
  },

  createProject: async (data) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to create project" };
    set((s) => ({ projects: [json, ...s.projects] }));
    get().fetchMetrics();
    return { data: json };
  },

  updateProject: async (id, data) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to update project" };
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? json : p)) }));
    get().fetchMetrics();
    return {};
  },

  deleteProject: async (id) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to delete project" };
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    get().fetchMetrics();
    return {};
  },

  // ── Invoices ──
  invoices: [],
  invoicesMeta: null,
  isLoadingInvoices: true,
  invoicesError: null,

  fetchInvoices: async (params = {}) => {
    const alreadyLoaded = get().invoices.length > 0;
    if (!alreadyLoaded) set({ isLoadingInvoices: true, invoicesError: null });
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.q) searchParams.set("q", params.q);
      if (params.status && params.status !== "all")
        searchParams.set("status", params.status);

      const res = await fetch(`/api/invoices?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const { data, metadata } = await res.json();
      set({ invoices: data, invoicesMeta: metadata });
    } catch (e) {
      set({ invoicesError: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      set({ isLoadingInvoices: false });
    }
  },

  createInvoice: async (data) => {
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to create invoice" };
    set((s) => ({ invoices: [json, ...s.invoices] }));
    // Refresh metrics so summary cards stay current
    get().fetchMetrics();
    return {};
  },

  updateInvoice: async (id, data) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to update invoice" };
    set((s) => ({
      invoices: s.invoices.map((inv) => (inv.id === id ? json : inv)),
    }));
    // Refresh metrics so summary cards stay current
    get().fetchMetrics();
    return {};
  },

  deleteInvoice: async (id) => {
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to delete invoice" };
    set((s) => ({ invoices: s.invoices.filter((inv) => inv.id !== id) }));
    get().fetchMetrics();
    return {};
  },

  markInvoicePaid: async (id) => {
    return get().updateInvoice(id, { status: "PAID" });
  },

  // ── Metrics ──
  dashboardMetrics: null,
  isLoadingMetrics: true,

  fetchMetrics: async () => {
    const alreadyLoaded = get().dashboardMetrics !== null;
    if (!alreadyLoaded) set({ isLoadingMetrics: true });
    try {
      const res = await fetch("/api/metrics");
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();
      set({ dashboardMetrics: data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoadingMetrics: false });
    }
  },
}));
