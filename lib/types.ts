// ─── Shared TypeScript types ───────────────────────────────────────────────────
// Our single source of truth

export interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  hasPortal: boolean;
  portalToken: string | null;
  createdAt: string;
  _count?: { projects: number; invoices: number };
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string | null;
  category: string | null;
  projectId: string;
  createdAt: string;
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
  category: string | null;
  clientId: string | null;
  client: { id: string; name: string; company: string | null } | null;
  createdAt: string;
  attachments?: Attachment[];
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
    date: Date | string;
  }>;
}
