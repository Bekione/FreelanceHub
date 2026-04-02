"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
} from "lucide-react";
import { useDataStore, type Client } from "@/store/data-store";
import { UpgradeModal } from "@/components/upgrade-modal";
import { FREE_LIMITS } from "@/lib/subscription/limits";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const emptyForm = { name: "", email: "", company: "", phone: "", notes: "" };

export function ClientsContent() {
  const {
    clients,
    clientsMeta,
    isLoadingClients,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  } = useDataStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") || "",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Sync state to URL
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
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
  }, [debouncedSearch, currentPage, pathname, router]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  const {
    register,
    handleSubmit,
    reset,
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

  useEffect(() => {
    fetchClients({
      page: currentPage,
      limit: 9,
      q: debouncedSearch,
    });
  }, [fetchClients, currentPage, debouncedSearch]);

  const openCreate = () => {
    setEditingClient(null);
    reset(emptyForm);
    setIsFormOpen(true);
  };
  const openEdit = (client: Client) => {
    setEditingClient(client);
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

  const onSubmit = async (data: typeof emptyForm) => {
    const result = editingClient
      ? await updateClient(editingClient.id, data)
      : await createClient(data);
    if (result.error) {
      if ((result as any).code === "UPGRADE_REQUIRED") {
        setIsFormOpen(false);
        setShowUpgradeModal(true);
        return;
      }
      toast.error("Failed", { description: result.error });
      return;
    }
    toast.success(editingClient ? "Client updated" : "Client added");
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    setIsDeleting(true);
    const result = await deleteClient(deletingClient.id);
    setIsDeleting(false);
    if (result.error) {
      // Keep the dialog open — let user read the error and decide
      toast.error("Cannot delete client", { description: result.error });
      return;
    }
    toast.success("Client deleted");
    setIsDeleteOpen(false);
  };

  const totalClients = clientsMeta?.totalItems ?? clients.length;
  const atLimit = !isLoadingClients && totalClients >= FREE_LIMITS.clients;

  return (
    <div className="space-y-6">
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        resource="clients"
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading">Clients</h2>
          <p className="text-muted-foreground mt-1">
            Manage your client relationships and contact information.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Usage indicator for Free users */}
          {!isLoadingClients && clientsMeta && (
            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">
                {totalClients} / {FREE_LIMITS.clients} clients used
              </span>
              <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
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
            onClick={atLimit ? () => setShowUpgradeModal(true) : openCreate}
          >
            {atLimit ? (
              <>
                <Zap className="mr-2 h-4 w-4" /> Upgrade for More
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Client
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
            placeholder="Search clients by name, company, or email..."
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

      {isLoadingClients ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 flex-1 flex flex-col justify-end">
                <Skeleton className="h-4 w-full mr-4" />
                <Skeleton className="h-4 w-4/5" />
                <div className="pt-2 border-t border-border/50">
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.length > 0 ? (
            clients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/10 shrink-0">
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
                  <CardContent className="space-y-2.5 pt-0">
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
                    {client._count && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/50">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {client._count.projects} projects
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {client._count.invoices} invoices
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : debouncedSearch !== "" ? (
            <div className="col-span-full py-16 text-center rounded-none border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
              <Search className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-lg font-medium text-foreground">
                No matching clients found
              </p>
              <p className="text-sm text-muted-foreground max-w-sm text-center">
                We couldn&apos;t find anything matching "{debouncedSearch}". Try
                adjusting your query.
              </p>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="col-span-full py-16 text-center rounded-none border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
              <UserPlus className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                No clients yet
              </p>
              <p className="text-sm text-muted-foreground/60">
                Start adding clients to your network!
              </p>
              <Button variant="outline" className="mt-4" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Client
              </Button>
            </div>
          )}
        </div>
      )}

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
              {editingClient ? "Edit Client" : "Add New Client"}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? "Update client details."
                : "Add a new client to your contact list."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register("phone")}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  {...register("company")}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional info..."
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
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingClient ? "Save Changes" : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingClient?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
