"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  useSuspenseQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  DollarSign,
  FolderOpen,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Filter,
  X,
  Zap,
  Paperclip,
  PenTool,
  Code,
  FileText,
  Video,
} from "lucide-react";
import type { Project } from "@/lib/types";
import { projectsQueryOptions } from "@/lib/queries/projects";
import { clientsQueryOptions } from "@/lib/queries/clients";
import { queryKeys } from "@/lib/queries/keys";
import { UpgradeModal } from "@/components/upgrade-modal";
import { FREE_LIMITS } from "@/lib/subscription/limits";
import { useSession } from "@/lib/auth-client";
import { ProjectAttachments } from "./project-attachments";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/translation-context";

type ProjectStatus = Project["status"];

const STATUS_OPTIONS: { value: ProjectStatus }[] = [
  { value: "PENDING" },
  { value: "ACTIVE" },
  { value: "COMPLETED" },
  { value: "ARCHIVED" },
];

const PLATFORM_OPTIONS = [
  "Upwork",
  "Fiverr",
  "Toptal",
  "Freelancer.com",
  "Direct / Local",
  "Remote OK",
  "Other",
];

const PROJECT_CATEGORIES = [
  { value: "development" },
  { value: "design" },
  { value: "copywriting" },
  { value: "video" },
  { value: "other" },
];

function statusVariant(status: ProjectStatus) {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "COMPLETED":
      return "secondary";
    case "PENDING":
      return "outline";
    case "ARCHIVED":
      return "outline";
  }
}

const getProjectCategoryIcon = (category: string | null | undefined) => {
  switch (category) {
    case "design":
      return <PenTool className="h-5 w-5 text-pink-500" />;
    case "development":
      return <Code className="h-5 w-5 text-blue-500" />;
    case "copywriting":
      return <FileText className="h-5 w-5 text-orange-500" />;
    case "video":
      return <Video className="h-5 w-5 text-purple-500" />;
    default:
      return <FolderOpen className="h-5 w-5 text-primary" />;
  }
};

const emptyForm = {
  title: "",
  description: "",
  clientId: "",
  deadline: "",
  budget: "",
  bonus: "",
  platform: "",
  category: "other",
  status: "PENDING" as ProjectStatus,
  createDraftInvoice: false,
  attachmentsUpdated: "",
};

export function ProjectsContent() {
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

  const { data: projectsData } = useSuspenseQuery(
    projectsQueryOptions({
      page: currentPage,
      limit: 9,
      q: debouncedSearch,
      status: statusFilter,
    }),
  );
  const projects = projectsData?.data ?? [];
  const projectsMeta = projectsData?.metadata ?? null;

  // Non-suspending query for clients (used only in form dropdowns)
  const { data: clientsData } = useQuery(clientsQueryOptions({ limit: 100 }));
  const clients = clientsData?.data ?? [];
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [autoPref, setAutoPref] = useState(false);

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

    // Only fetch if url actually changed to prevent loop
    const currentQuery = new URLSearchParams(window.location.search).toString();
    if (query !== currentQuery) {
      router.push(url, { scroll: false });
    }
  }, [debouncedSearch, statusFilter, currentPage, pathname, router]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  useEffect(() => {
    fetch("/api/settings/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.autoCreateInvoice !== undefined) {
          setAutoPref(d.autoCreateInvoice);
        }
      })
      .catch(() => {});
  }, []);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Data is fetched reactively by useSuspenseQuery above — no manual effect needed

  const openCreate = () => {
    setEditingProject(null);
    reset({ ...emptyForm, createDraftInvoice: autoPref });
    setIsFormOpen(true);
  };
  const openEdit = (project: Project) => {
    setEditingProject(project);
    reset({
      title: project.title,
      description: project.description ?? "",
      clientId: project.clientId ?? "",
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().split("T")[0]
        : "",
      budget: project.budget ? project.budget.toString() : "",
      bonus: project.bonus ? project.bonus.toString() : "",
      platform: project.platform || "",
      category: project.category || "other",
      status: project.status,
      createDraftInvoice: false,
      attachmentsUpdated: "",
    });
    setIsFormOpen(true);
  };
  const openDelete = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = editingProject
        ? `/api/projects/${editingProject.id}`
        : "/api/projects";
      const method = editingProject ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw json;
      return json;
    },
    onSuccess: async (savedProject) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.metrics() });
      // Auto-create draft invoice if checked on new project
      if (
        !editingProject &&
        createDraftInvoiceRef.current &&
        savedProject?.id
      ) {
        const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceNumber: invoiceNum,
            projectId: savedProject.id,
            clientId: savedProject.clientId ?? null,
            amount: savedProject.budget ?? 0,
            dueDate: dueDate.toISOString(),
            status: "DRAFT",
          }),
        });
        await queryClient.invalidateQueries({ queryKey: queryKeys.invoices() });
      }
      toast.success(
        editingProject
          ? t("toasts.projectUpdated")
          : t("toasts.projectCreated"),
      );
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      if (err?.error === "UPGRADE_REQUIRED") {
        setIsFormOpen(false);
        setShowUpgradeModal(true);
        return;
      }
      toast.error(t("toasts.failed"), {
        description: err?.error ?? "Unknown error",
      });
    },
  });

  // ref to read checkbox value inside async mutation callback
  const createDraftInvoiceRef = useRef(false);

  const onSubmit = async (formData: typeof emptyForm) => {
    const { createDraftInvoice, ...projectData } = formData;
    createDraftInvoiceRef.current = createDraftInvoice;
    const payload = {
      ...projectData,
      clientId: projectData.clientId || undefined,
      budget: projectData.budget ? parseFloat(projectData.budget) : null,
      bonus: projectData.bonus ? parseFloat(projectData.bonus) : null,
    };
    saveMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw json;
      return json;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.metrics() });
      toast.success(t("toasts.projectDeleted"));
      setIsDeleteOpen(false);
    },
    onError: (err: any) => {
      toast.error(t("toasts.failed"), {
        description: err?.error ?? "Unknown error",
      });
      setIsDeleteOpen(false);
    },
  });

  const handleDelete = async () => {
    if (!deletingProject) return;
    deleteMutation.mutate(deletingProject.id);
  };

  const isDeleting = deleteMutation.isPending;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { data: session } = useSession();
  const t = useTranslation();
  const isPro =
    (session?.user as any)?.subscriptionStatus === "active" ||
    (session?.user as any)?.subscriptionStatus === "past_due";

  const totalProjects = projectsMeta?.totalItems ?? projects.length;
  const atLimit = totalProjects >= FREE_LIMITS.projects;

  return (
    <>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        resource="projects"
      />
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-heading">
              {t("projects.title")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("projects.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {projectsMeta && !isPro && (
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">
                  {totalProjects} / {FREE_LIMITS.projects}{" "}
                  {t("projects.usedOf")}
                </span>
                <div className="w-32 h-1.5 bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      atLimit ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min((totalProjects / FREE_LIMITS.projects) * 100, 100)}%`,
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
                  <Plus className="mr-2 h-4 w-4" /> {t("projects.new")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex items-center flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("projects.searchPlaceholder")}
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
              <SelectValue placeholder={t("projects.filterStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("projects.allStatuses")}</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {t(`projects.status.${s.value}` as any)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="h-full group hover:shadow-md transition-shadow flex flex-col relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 shrink-0 bg-primary/10 flex items-center justify-center">
                        {getProjectCategoryIcon(project.category)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={statusVariant(project.status)}
                          className="capitalize text-xs shrink-0"
                        >
                          {project.status.toLowerCase()}
                        </Badge>
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/90 backdrop-blur-sm border shadow-sm z-10 p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(project)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => openDelete(project)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <CardTitle
                        className="text-base leading-tight line-clamp-2 break-all pr-2"
                        title={project.title}
                      >
                        {project.title}
                      </CardTitle>
                      <CardDescription className="pt-1 truncate">
                        {project.client?.name ?? t("projects.noClient")}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
                      {project.description || t("projects.noDescription")}
                    </p>
                    <div className="space-y-2">
                      {project.platform && (
                        <p className="text-xs text-muted-foreground">
                          {t("projects.via")}{" "}
                          <span className="font-medium text-foreground">
                            {project.platform}
                          </span>
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm py-2 border-t border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {project.deadline
                                ? new Date(
                                    project.deadline,
                                  ).toLocaleDateString()
                                : t("projects.noDeadline")}
                            </span>
                          </div>
                          {(project.attachments?.length ?? 0) > 0 && (
                            <div
                              className="flex items-center gap-1 text-muted-foreground"
                              title={`${project.attachments?.length} attachments`}
                            >
                              <Paperclip className="h-3 w-3" />
                              <span className="text-xs">
                                {project.attachments?.length}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
                          <span>
                            {project.budget
                              ? project.budget.toLocaleString()
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : debouncedSearch !== "" || statusFilter !== "all" ? (
            <div className="col-span-full py-16 text-center rounded-none border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
              <Search className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-lg font-medium text-foreground">
                {t("projects.noMatch")}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm text-center">
                {t("projects.noMatchSubtitle")}
              </p>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                {t("projects.clearFilters")}
              </Button>
            </div>
          ) : (
            <div className="col-span-full py-16 text-center rounded-none border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
              <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                {t("projects.empty")}
              </p>
              <p className="text-sm text-muted-foreground/60">
                {t("projects.emptySubtitle")}
              </p>
              <Button variant="outline" className="mt-4" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> {t("projects.addFirst")}
              </Button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {projectsMeta && projectsMeta.totalPages > 1 && (
          <div className="py-4 flex justify-center border-t border-border/50">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground px-4 py-2 font-medium">
                    Page {projectsMeta.currentPage} of {projectsMeta.totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(projectsMeta.totalPages, p + 1),
                      )
                    }
                    className={
                      currentPage === projectsMeta.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Create / Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[540px]">
            <DialogHeader>
              <DialogTitle>
                {editingProject
                  ? t("projects.form.editProject")
                  : t("projects.form.newProject")}
              </DialogTitle>
              <DialogDescription>
                {editingProject
                  ? t("projects.form.editSubtitle")
                  : t("projects.form.createSubtitle")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="max-h-[60vh] overflow-y-auto px-2 -mx-2 space-y-4 pb-1">
                <div className="space-y-2">
                  <Label htmlFor="title">{t("projects.form.title")} *</Label>
                  <Input
                    id="title"
                    placeholder={t("projects.form.titlePlaceholder")}
                    {...register("title", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t("projects.form.description")}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t("projects.form.descriptionPlaceholder")}
                    {...register("description")}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("projects.form.client")}</Label>
                    <Select
                      value={watch("clientId")}
                      onValueChange={(v) =>
                        setValue("clientId", v === "none" ? "" : v, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("projects.form.selectClient")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {t("projects.form.noClient")}
                        </SelectItem>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("projects.form.status")}</Label>
                    <Select
                      value={watch("status")}
                      onValueChange={(v) =>
                        setValue("status", v as ProjectStatus, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {t(`projects.status.${s.value}` as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">
                      {t("projects.form.deadline")}
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      {...register("deadline")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">{t("projects.form.budget")}</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="5000"
                      {...register("budget")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonus">{t("projects.form.bonus")}</Label>
                    <Input
                      id="bonus"
                      type="number"
                      placeholder="0"
                      {...register("bonus")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("projects.form.platform")}</Label>
                    <Select
                      value={watch("platform")}
                      onValueChange={(v) =>
                        setValue("platform", v === "none" ? "" : v, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("projects.form.platformPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {t("projects.form.notSpecified")}
                        </SelectItem>
                        {PLATFORM_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("projects.form.category")}</Label>
                    <Select
                      value={watch("category")}
                      onValueChange={(v) =>
                        setValue("category", v, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("projects.form.categoryPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {t(`projects.categories.${c.value}` as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Hidden field for form dirtiness on attachment actions */}
                <input type="hidden" {...register("attachmentsUpdated")} />

                {/* Auto-draft invoice — only on create */}
                {!editingProject && (
                  <div className="flex items-center gap-3">
                    <input
                      id="createDraftInvoice"
                      type="checkbox"
                      className="h-4 w-4 accent-primary cursor-pointer"
                      {...register("createDraftInvoice")}
                    />
                    <label
                      htmlFor="createDraftInvoice"
                      className="text-sm cursor-pointer select-none"
                    >
                      {t("projects.form.autoDraftInvoice")}
                    </label>
                  </div>
                )}

                {/* Attachments Section — only for existing projects */}
                {editingProject && (
                  <div className="pt-4 border-t border-border mt-4">
                    <ProjectAttachments
                      projectId={editingProject.id}
                      attachments={
                        projects.find((p) => p.id === editingProject.id)
                          ?.attachments || []
                      }
                      onAttachmentChange={() =>
                        setValue("attachmentsUpdated", Date.now().toString(), {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4 pt-4 border-t border-border">
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
                  {editingProject
                    ? t("projects.form.updateProject")
                    : t("projects.form.createProject")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t("projects.delete.title")}</DialogTitle>
              <DialogDescription>
                {t("projects.delete.description")}{" "}
                <strong>{deletingProject?.title}</strong>?{" "}
                {t("projects.delete.cannotUndo")}
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
                {t("projects.delete.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
