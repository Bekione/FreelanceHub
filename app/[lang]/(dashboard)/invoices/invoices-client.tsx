"use client";

import { useState, useEffect, useCallback } from "react";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Trash2,
  CheckCircle,
  Wallet,
  Loader2,
  X,
  Pencil,
  Zap,
  Printer,
} from "lucide-react";
import type { Invoice } from "@/lib/types";
import { invoicesQueryOptions } from "@/lib/queries/invoices";
import { metricsQueryOptions } from "@/lib/queries/dashboard";
import { clientsQueryOptions } from "@/lib/queries/clients";
import { projectsQueryOptions } from "@/lib/queries/projects";
import { queryKeys } from "@/lib/queries/keys";
import { UpgradeModal } from "@/components/upgrade-modal";
import { FREE_LIMITS } from "@/lib/subscription/limits";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/translation-context";

type InvoiceStatus = Invoice["status"];

function statusVariant(status: InvoiceStatus) {
  switch (status) {
    case "PAID":
      return "secondary";
    case "PENDING":
      return "default";
    case "OVERDUE":
      return "destructive";
    case "DRAFT":
      return "outline";
    case "CANCELLED":
      return "outline";
  }
}

function generateInvoiceNumber() {
  return `INV-${Date.now().toString().slice(-6)}`;
}

const emptyForm = {
  invoiceNumber: generateInvoiceNumber(),
  clientId: "",
  projectId: "",
  amount: "",
  dueDate: "",
  notes: "",
  status: "DRAFT" as Invoice["status"],
};

export function InvoicesContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") || "",
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );

  const { data: invoicesData } = useSuspenseQuery(
    invoicesQueryOptions({ page: currentPage, limit: 10, q: debouncedSearch, status: statusFilter })
  );
  const invoices = invoicesData?.data ?? [];
  const invoicesMeta = invoicesData?.metadata ?? null;

  const { data: metricsData } = useSuspenseQuery(metricsQueryOptions());
  const { data: clientsData } = useQuery(clientsQueryOptions({ limit: 100 }));
  const { data: projectsData } = useQuery(projectsQueryOptions({ limit: 100 }));
  const clients = clientsData?.data ?? [];
  const projects = projectsData?.data ?? [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  // Sync state to URL
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    }

    if (statusFilter && statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    const currentQuery = new URLSearchParams(window.location.search).toString();
    if (query !== currentQuery) {
      router.push(url, { scroll: false });
    }
  }, [debouncedSearch, statusFilter, currentPage, pathname, router]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm({
    defaultValues: emptyForm,
  });

  // Smart form: watch selected client and project
  const selectedClientId = watch("clientId");
  const selectedProjectId = watch("projectId");

  // Filter projects to only those belonging to the selected client
  const projectsForForm = selectedClientId
    ? projects.filter((p) => !p.clientId || p.clientId === selectedClientId)
    : projects;

  // When project changes → auto-fill client + amount from project budget
  useEffect(() => {
    if (!selectedProjectId || selectedProjectId === "none") return;
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) return;
    if (proj.clientId && !selectedClientId) {
      setValue("clientId", proj.clientId, { shouldDirty: true });
    }
    if (proj.budget != null) {
      setValue("amount", proj.budget.toString(), { shouldDirty: true });
    }
  }, [selectedProjectId, projects, selectedClientId, setValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Data is fetched reactively by hooks above — no manual effect needed

  const openCreate = () => {
    setEditingInvoice(null);
    reset({ ...emptyForm, invoiceNumber: generateInvoiceNumber() });
    setIsFormOpen(true);
  };

  const openEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    reset({
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId ?? "",
      projectId: invoice.projectId ?? "",
      amount: invoice.amount.toString(),
      dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
      notes: invoice.notes ?? "",
      status: invoice.status,
    });
    setIsFormOpen(true);
  };

  const openDelete = (invoice: Invoice) => {
    setDeletingInvoice(invoice);
    setIsDeleteOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = editingInvoice ? `/api/invoices/${editingInvoice.id}` : "/api/invoices";
      const method = editingInvoice ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw json;
      return json;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.invoices() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.metrics() });
      toast.success(editingInvoice ? t("toasts.invoiceUpdated") : t("toasts.invoiceCreated"));
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      if (err?.error === "UPGRADE_REQUIRED") {
        setIsFormOpen(false);
        setShowUpgradeModal(true);
        return;
      }
      toast.error(t("toasts.failed"), { description: err?.error ?? "Unknown error" });
    },
  });

  const onSubmit = async (formData: typeof emptyForm) => {
    const payload = {
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      clientId: formData.clientId || null,
      projectId: formData.projectId || null,
      ...(editingInvoice ? { status: formData.status } : {}),
    };
    saveMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw json;
      return json;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.invoices() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.metrics() });
      toast.success(t("toasts.invoiceDeleted"));
      setIsDeleteOpen(false);
    },
    onError: (err: any) => {
      toast.error(t("toasts.failedToDelete"), { description: err?.error ?? "Unknown error" });
    },
  });

  const handleDelete = async () => {
    if (!deletingInvoice) return;
    deleteMutation.mutate(deletingInvoice.id);
  };

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      const json = await res.json();
      if (!res.ok) throw json;
      return json;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.invoices() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.metrics() });
      toast.success(t("toasts.invoiceMarkedPaid"));
    },
    onError: (err: any) => {
      toast.error(t("toasts.failed"), { description: err?.error ?? "Unknown error" });
    },
  });

  const handleMarkPaid = async (id: string) => {
    markPaidMutation.mutate(id);
  };

  const markingPaidId = markPaidMutation.isPending ? markPaidMutation.variables : null;
  const isDeleting = deleteMutation.isPending;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data: session } = useSession();
  const t = useTranslation();
  const isPro =
    (session?.user as any)?.subscriptionStatus === "active" ||
    (session?.user as any)?.subscriptionStatus === "past_due";
  const totalAmount =
    (metricsData?.totalRevenue || 0) +
    (metricsData?.pendingInvoicesAmount || 0);
  const paidAmount = metricsData?.totalRevenue || 0;
  const pendingAmount = metricsData?.pendingInvoicesAmount || 0;
  const totalInvoices = invoicesMeta?.totalItems ?? invoices.length;
  const atLimit = totalInvoices >= FREE_LIMITS.invoicesPerMonth;

  return (
    <>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        resource="invoices"
      />
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-heading">{t("invoices.title")}</h2>
            <p className="text-muted-foreground mt-1">
              {t("invoices.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isPro && invoicesMeta && (
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">
                  {totalInvoices} / {FREE_LIMITS.invoicesPerMonth} {t("invoices.usedOf")}
                </span>
                <div className="w-32 h-1.5 bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      atLimit ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min((totalInvoices / FREE_LIMITS.invoicesPerMonth) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <Button
              onClick={
                !isPro && atLimit ? () => setShowUpgradeModal(true) : openCreate
              }
            >
              {!isPro && atLimit ? (
                <>
                  <Zap className="mr-2 h-4 w-4" /> {t("common.upgrade")}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> {t("invoices.new")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: t("invoices.total"), value: totalAmount, color: "" },
            {
              label: t("invoices.paid"),
              value: paidAmount,
              color: "text-green-600 dark:text-green-500",
            },
            {
              label: t("invoices.pendingOverdue"),
              value: pendingAmount,
              color: "text-orange-600 dark:text-orange-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`flex items-center text-2xl font-bold ${stat.color}`}
                  >
                    <span className="mr-1">$</span>
                    {stat.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex items-center flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("invoices.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 flex-1"
            />
            <Button
              className={`-ml-9 text-muted-foreground bg-transparent 
              hover:text-foreground hover:bg-muted transition-colors
              ${searchTerm ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              onClick={() => setSearchTerm("")}
              size="xs"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t("invoices.filterStatus")} />
            </SelectTrigger>
            <SelectContent>
              {["all", "DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all"
                      ? t("invoices.allStatuses")
                      : t(`invoices.status_values.${s}` as any)}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="p-0">
            <div className="border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>{t("invoices.invoiceNumber")}</TableHead>
                      <TableHead>{t("invoices.client")}</TableHead>
                      <TableHead>{t("invoices.project")}</TableHead>
                      <TableHead>{t("invoices.amount")}</TableHead>
                      <TableHead>{t("invoices.status")}</TableHead>
                      <TableHead>{t("invoices.dueDate")}</TableHead>
                      <TableHead className="text-right">{t("invoices.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <TableRow
                          key={invoice.id}
                          className="group transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="font-mono text-xs font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell className="font-medium">
                            {invoice.client?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {invoice.project?.title ?? "—"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${invoice.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusVariant(invoice.status)}
                              className="capitalize text-xs"
                            >
                              {t(`invoices.status_values.${invoice.status}` as any)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {invoice.status !== "PAID" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="relative h-8 w-8 text-green-600"
                                  title={t("invoices.markPaid")}
                                  disabled={markingPaidId === invoice.id}
                                  onClick={() => handleMarkPaid(invoice.id)}
                                >
                                  <span className="flex items-center justify-center w-4 h-4">
                                    {markingPaidId === invoice.id ? (
                                      <Loader2
                                        className="h-4 w-4 animate-spin"
                                        style={{
                                          transformOrigin: "center",
                                          transformBox: "fill-box",
                                        }}
                                      />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-primary transition-colors"
                                title={t("invoices.print")}
                                onClick={() => {
                                  const locale = window.location.pathname.split("/")[1] || "en";
                                  window.open(`/${locale}/invoices/${invoice.id}/print`, "_blank");
                                }}
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(invoice)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => openDelete(invoice)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : debouncedSearch !== "" || statusFilter !== "all" ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={7}
                          className="h-48 text-center bg-transparent"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Search className="h-8 w-8 opacity-20" />
                            <p className="font-medium text-foreground">
                              {t("invoices.noMatch")}
                            </p>
                            <p className="text-sm">
                              {t("invoices.noMatchSubtitle")}
                            </p>
                            <Button
                              variant="ghost"
                              className="mt-2"
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                              }}
                            >
                              {t("invoices.clearFilters")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={7}
                          className="h-48 text-center bg-transparent"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <FileText className="h-8 w-8 opacity-20" />
                            <p className="font-medium text-foreground">
                              {t("invoices.empty")}
                            </p>
                            <p className="text-sm">
                              {t("invoices.emptySubtitle")}
                            </p>
                            <Button
                              variant="outline"
                              className="mt-2"
                              onClick={openCreate}
                            >
                              <Plus className="h-4 w-4 mr-2" /> {t("invoices.createFirst")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              
            </div>
            {/* Pagination Controls */}
            {invoicesMeta && invoicesMeta.totalPages > 1 && (
              <div className="py-4 border-t border-border/50">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm text-muted-foreground px-4 py-2 font-medium">
                        Page {invoicesMeta.currentPage} of{" "}
                        {invoicesMeta.totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(invoicesMeta.totalPages, p + 1),
                          )
                        }
                        className={
                          currentPage === invoicesMeta.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Create / Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? t("invoices.form.editInvoice") : t("invoices.form.newInvoice")}
              </DialogTitle>
              <DialogDescription>
                {editingInvoice
                  ? t("invoices.form.editSubtitle")
                  : t("invoices.form.createSubtitle")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">{t("invoices.form.invoiceNumber")} *</Label>
                  <Input
                    id="invoiceNumber"
                    {...register("invoiceNumber", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("invoices.form.amount")} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    {...register("amount", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("invoices.form.client")}</Label>
                  <Select
                    value={watch("clientId")}
                    onValueChange={(v) =>
                      setValue("clientId", v === "none" ? "" : v, {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("invoices.form.selectClient")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("invoices.form.noClient")}</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("invoices.form.project")}</Label>
                  <Select
                    value={watch("projectId")}
                    onValueChange={(v) =>
                      setValue("projectId", v === "none" ? "" : v, {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full overflow-hidden [&>span]:truncate [&>span]:block">
                      <SelectValue placeholder={t("invoices.form.selectProject")} />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="max-h-[300px] w-(--radix-select-trigger-width)"
                    >
                      <SelectItem value="none">{t("invoices.form.noProject")}</SelectItem>
                      {projectsForForm.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          title={p.title}
                          className="w-full pr-8 [&>span:last-child]:min-w-0 [&>span:last-child]:truncate [&>span:last-child]:block"
                        >
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Status — only shown when editing */}
                {editingInvoice && (
                  <div className="col-span-2 space-y-2">
                    <Label>{t("invoices.form.status")}</Label>
                    <Select
                      value={watch("status")}
                      onValueChange={(v) =>
                        setValue("status", v as Invoice["status"], {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "DRAFT",
                            "PENDING",
                            "PAID",
                            "OVERDUE",
                            "CANCELLED",
                          ] as const
                        ).map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`invoices.status_values.${s}` as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="dueDate">{t("invoices.form.dueDate")} *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register("dueDate", { required: true })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">{t("invoices.form.notes")}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t("invoices.form.notesPlaceholder")}
                    {...register("notes")}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingInvoice ? t("invoices.form.saveChanges") : t("invoices.form.createInvoice")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t("invoices.delete.title")}</DialogTitle>
              <DialogDescription>
                {t("invoices.delete.description")}{" "}
                <strong>{deletingInvoice?.invoiceNumber}</strong>? {t("invoices.delete.cannotUndo")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("invoices.delete.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
