"use client";

import { useState, useEffect, useRef } from "react";
import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ClientsSkeleton } from "./clients-skeleton";
import { useForm } from "react-hook-form";
import { useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Mail,
  Phone,
  Building,
  UserPlus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  FolderOpen,
  Search,
  X,
  Zap,
  Globe,
  Link,
  Loader2 as SpinnerLoader,
  Camera,
} from "lucide-react";
import type { Client } from "@/lib/types";
import { clientsQueryOptions } from "@/lib/queries/clients";
import { queryKeys } from "@/lib/queries/keys";
import { UpgradeModal } from "@/components/upgrade-modal";
import { FREE_LIMITS } from "@/lib/subscription/limits";
import { useSession } from "@/lib/auth-client";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/translation-context";

const emptyForm = { name: "", email: "", company: "", phone: "", notes: "" };

export function ClientsContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") || "",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );

  const { data, isFetching, isLoading } = useQuery({
    ...clientsQueryOptions({ page: currentPage, limit: 9, q: debouncedSearch }),
    placeholderData: keepPreviousData,
  });
  const clients = data?.data ?? [];
  const clientsMeta = data?.metadata ?? null;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeResource, setUpgradeResource] = useState<"clients" | "portals">(
    "clients",
  );
  const [isTogglingPortal, setIsTogglingPortal] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const t = useTranslation();
  const isPro =
    (session?.user as any)?.subscriptionStatus === "active" ||
    (session?.user as any)?.subscriptionStatus === "past_due";

  // Sync filters to URL without triggering server navigation
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (currentPage > 1) params.set("page", currentPage.toString());
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    const currentQuery = new URLSearchParams(window.location.search).toString();
    if (query !== currentQuery) {
      window.history.replaceState(null, "", url);
    }
  }, [debouncedSearch, currentPage, pathname]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
  }, [debouncedSearch]);

  // Data is fetched reactively by useSuspenseQuery above — no manual effect needed

  const openCreate = () => {
    setEditingClient(null);
    setPhotoPreview(null);
    setUploadedImageUrl(null);
    setPhotoChanged(false);
    reset(emptyForm);
    setIsFormOpen(true);
  };
  const openEdit = (client: Client) => {
    setEditingClient(client);
    setPhotoPreview((client as any).imageUrl ?? null);
    setUploadedImageUrl((client as any).imageUrl ?? null);
    setPhotoChanged(false);
    reset({
      name: client.name,
      email: client.email ?? "",
      company: client.company ?? "",
      phone: client.phone ?? "",
      notes: client.notes ?? "",
    });
    setIsFormOpen(true);
  };
  const openDelete = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use absolute local URL for smooth, flicker-free preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setPhotoChanged(true); // Allow saving
    setIsUploadingPhoto(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("intent", "clientPhoto");
      if (editingClient) form.append("clientId", editingClient.id);

      const res = await fetch("/api/upload?intent=clientPhoto", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Photo upload failed");
        setPhotoPreview((editingClient as any)?.imageUrl ?? null);
        setPhotoChanged(false);
      } else {
        setUploadedImageUrl(data.url);
        // If editing an existing client, the upload route already persisted it to DB!
        // Invalidate the query so the cards update behind the modal.
        if (editingClient) {
          queryClient.invalidateQueries({ queryKey: queryKeys.clients() });
        }
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof emptyForm & { imageUrl?: string }) => {
      const url = editingClient
        ? `/api/clients/${editingClient.id}`
        : "/api/clients";
      const method = editingClient ? "PATCH" : "POST";
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.metrics() });
      toast.success(
        editingClient ? t("toasts.clientUpdated") : t("toasts.clientAdded"),
      );
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      if (err?.error === "UPGRADE_REQUIRED") {
        setIsFormOpen(false);
        setUpgradeResource("clients");
        setShowUpgradeModal(true);
        return;
      }
      toast.error(t("toasts.failed"), {
        description: err?.error ?? "Unknown error",
      });
    },
  });

  const onSubmit = async (formData: typeof emptyForm) => {
    const payload: typeof emptyForm & { imageUrl?: string } = { ...formData };
    if (!editingClient && uploadedImageUrl) payload.imageUrl = uploadedImageUrl;
    saveMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw json;
      return json;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.metrics() });
      toast.success(t("toasts.clientDeleted"));
      setIsDeleteOpen(false);
    },
    onError: (err: any) => {
      toast.error(t("toasts.failed"), {
        description: err?.error ?? "Unknown error",
      });
    },
  });

  const handleDelete = async () => {
    if (!deletingClient) return;
    deleteMutation.mutate(deletingClient.id);
  };

  const isDeleting = deleteMutation.isPending;

  if (isLoading) return <ClientsSkeleton />;

  const handleTogglePortal = async (
    client: Client,
    action: "ENABLE" | "DISABLE",
  ) => {
    setIsTogglingPortal(client.id);
    try {
      const res = await fetch(`/api/clients/${client.id}/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "UPGRADE_REQUIRED") {
          setUpgradeResource("portals");
          setShowUpgradeModal(true);
        } else {
          toast.error(data.error || t("toasts.failedToTogglePortal"));
        }
        setIsTogglingPortal(null);
        return;
      }

      // Invalidate to reflect portal changes
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients() });
      toast.success(
        action === "ENABLE"
          ? t("toasts.portalGenerated")
          : t("toasts.portalDisabled"),
      );
    } catch (e) {
      toast.error(t("toasts.failedToTogglePortal"));
    } finally {
      setIsTogglingPortal(null);
    }
  };

  const copyPortalLink = (client: Client) => {
    if (!client.portalToken) return;
    const url = `${window.location.origin}/portal/${client.id}/${client.portalToken}`;
    navigator.clipboard.writeText(url);
    toast.success(t("toasts.portalLinkCopied"));
  };

  const totalClients = clientsMeta?.totalItems ?? clients.length;
  const atLimit = totalClients >= FREE_LIMITS.clients;

  return (
    <>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        resource={upgradeResource}
      />
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-heading">
              {t("clients.title")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("clients.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Usage indicator for Free users */}
            {clientsMeta && !isPro && (
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">
                  {totalClients} / {FREE_LIMITS.clients} {t("clients.usedOf")}
                </span>
                <div className="w-32 h-1.5 bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      atLimit ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min((totalClients / FREE_LIMITS.clients) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <Button
              onClick={
                !isPro && atLimit
                  ? () => {
                      setUpgradeResource("clients");
                      setShowUpgradeModal(true);
                    }
                  : openCreate
              }
            >
              {!isPro && atLimit ? (
                <>
                  <Zap className="mr-2 h-4 w-4" /> {t("common.upgrade")}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> {t("clients.new")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex items-center flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("clients.searchPlaceholder")}
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
        </div>

        <div
          className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}
        >
          {clients.length > 0 ? (
            clients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full group hover:shadow-md transition-shadow flex flex-col bg-card overflow-hidden border-border/50">
                  <CardHeader className="pb-4 flex-none">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/10 shrink-0">
                        {(client as any).imageUrl && (
                          <AvatarImage
                            src={(client as any).imageUrl}
                            alt={client.name}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors truncate">
                          {client.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Building className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {client.company || "—"}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(client)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => openDelete(client)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex flex-col flex-1 px-4 ">
                    <div className="space-y-2.5">
                      {client.email && (
                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className="h-7 w-7 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                            <Mail className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className="h-7 w-7 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                            <Phone className="h-3.5 w-3.5" />
                          </div>
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto border-t border-border/50 flex justify-between items-center pt-4">
                      {client._count && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span
                            className="flex items-center gap-1"
                            title={
                              client._count.projects.toString() + " Projects"
                            }
                          >
                            <FolderOpen className="h-3 w-3" />
                            {client._count.projects}
                          </span>
                          <span
                            className="flex items-center gap-1"
                            title={
                              client._count.invoices.toString() + " Invoices"
                            }
                          >
                            <FileText className="h-3 w-3" />
                            {client._count.invoices}
                          </span>
                        </div>
                      )}

                      {/* Interactive Portal actions */}
                      <div className="flex items-center gap-2">
                        {client.hasPortal ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPortalLink(client)}
                              className="h-8 gap-1 text-primary hover:text-primary transition-colors"
                            >
                              <Link className="h-3.5 w-3.5" />{" "}
                              {t("clients.portal.copy")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleTogglePortal(client, "DISABLE")
                              }
                              disabled={isTogglingPortal === client.id}
                              className="h-8 gap-1 text-destructive hover:text-destructive transition-colors border-destructive/20 hover:bg-destructive/10"
                            >
                              {isTogglingPortal === client.id ? (
                                <SpinnerLoader className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                t("clients.portal.disable")
                              )}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePortal(client, "ENABLE")}
                            disabled={isTogglingPortal === client.id}
                            className="h-8 gap-1 text-muted-foreground hover:text-foreground transition-colors bg-transparent"
                          >
                            {isTogglingPortal === client.id ? (
                              <SpinnerLoader className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Globe className="h-3.5 w-3.5" />{" "}
                                {t("clients.portal.enable")}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : debouncedSearch !== "" ? (
            <div className="col-span-full py-16 text-center rounded-none border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
              <Search className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-lg font-medium text-foreground">
                {t("clients.noMatch")}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm text-center">
                {t("clients.noMatchQuery").replace("{query}", debouncedSearch)}
              </p>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => setSearchTerm("")}
              >
                {t("clients.clearSearch")}
              </Button>
            </div>
          ) : (
            <div className="col-span-full py-16 text-center rounded-none border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
              <UserPlus className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                {t("clients.empty")}
              </p>
              <p className="text-sm text-muted-foreground/60">
                {t("clients.emptySubtitle")}
              </p>
              <Button variant="outline" className="mt-4" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> {t("clients.addFirst")}
              </Button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {clientsMeta && clientsMeta.totalPages > 1 && (
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
                    Page {clientsMeta.currentPage} of {clientsMeta.totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(clientsMeta.totalPages, p + 1),
                      )
                    }
                    className={
                      currentPage === clientsMeta.totalPages
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
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>
                {editingClient
                  ? t("clients.form.editClient")
                  : t("clients.form.newClient")}
              </DialogTitle>
              <DialogDescription>
                {editingClient
                  ? t("clients.form.editSubtitle")
                  : t("clients.form.createSubtitle")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              {/* Photo picker */}
              <div className="flex justify-center">
                <div className="relative group">
                  <Avatar
                    className="h-20 w-20 border-2 border-primary/20 cursor-pointer"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {photoPreview && (
                      <AvatarImage
                        src={photoPreview}
                        alt="Client"
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary/5 text-primary text-xl font-semibold">
                      {watch("name")?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">{t("clients.form.name")} *</Label>
                  <Input
                    id="name"
                    placeholder={t("clients.form.namePlaceholder")}
                    {...register("name", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("clients.form.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("clients.form.emailPlaceholder")}
                    {...register("email")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("clients.form.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("clients.form.phonePlaceholder")}
                    {...register("phone")}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="company">{t("clients.form.company")}</Label>
                  <Input
                    id="company"
                    placeholder={t("clients.form.companyPlaceholder")}
                    {...register("company")}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">{t("clients.form.notes")}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t("clients.form.notesPlaceholder")}
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
                <Button
                  type="submit"
                  disabled={
                    saveMutation.isPending ||
                    isUploadingPhoto ||
                    (!isDirty && !photoChanged)
                  }
                >
                  {saveMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingClient
                    ? t("clients.form.updateClient")
                    : t("clients.form.createClient")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t("clients.delete.title")}</DialogTitle>
              <DialogDescription>
                {t("clients.delete.description")}{" "}
                <strong>{deletingClient?.name}</strong>?{" "}
                {t("clients.delete.warning")}
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
                {t("clients.delete.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
