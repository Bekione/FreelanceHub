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

// ─── Store Definitions ────────────────────────────────────────────────────────

interface ClientsState {
  clients: Client[];
  isLoadingClients: boolean;
  clientsError: string | null;
  fetchClients: () => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<{ error?: string }>;
  updateClient: (
    id: string,
    data: Partial<Client>,
  ) => Promise<{ error?: string }>;
  deleteClient: (id: string) => Promise<{ error?: string }>;
}

interface ProjectsState {
  projects: Project[];
  isLoadingProjects: boolean;
  projectsError: string | null;
  fetchProjects: () => Promise<void>;
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
  isLoadingInvoices: boolean;
  invoicesError: string | null;
  fetchInvoices: () => Promise<void>;
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

type DataState = ClientsState & ProjectsState & InvoicesState;

// ─── Store Implementation ─────────────────────────────────────────────────────

export const useDataStore = create<DataState>((set, get) => ({
  // ── Clients ──
  clients: [],
  isLoadingClients: false,
  clientsError: null,

  fetchClients: async () => {
    set({ isLoadingClients: true, clientsError: null });
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      set({ clients: data });
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
    return {};
  },

  deleteClient: async (id) => {
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to delete client" };
    set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }));
    return {};
  },

  // ── Projects ──
  projects: [],
  isLoadingProjects: false,
  projectsError: null,

  fetchProjects: async () => {
    set({ isLoadingProjects: true, projectsError: null });
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      set({ projects: data });
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
    return {};
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
    return {};
  },

  deleteProject: async (id) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to delete project" };
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    return {};
  },

  // ── Invoices ──
  invoices: [],
  isLoadingInvoices: false,
  invoicesError: null,

  fetchInvoices: async () => {
    set({ isLoadingInvoices: true, invoicesError: null });
    try {
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      set({ invoices: data });
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
    return {};
  },

  deleteInvoice: async (id) => {
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Failed to delete invoice" };
    set((s) => ({ invoices: s.invoices.filter((inv) => inv.id !== id) }));
    return {};
  },

  markInvoicePaid: async (id) => {
    return get().updateInvoice(id, { status: "PAID" });
  },
}));
