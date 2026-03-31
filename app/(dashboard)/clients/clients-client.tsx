"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
} from "lucide-react";
import { useDataStore, type Client } from "@/store/data-store";
import { Button } from "@/components/ui/button";
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
    isLoadingClients,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({
    defaultValues: emptyForm,
  });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading">Clients</h2>
          <p className="text-muted-foreground mt-1">
            Manage your client relationships and contact information.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {isLoadingClients ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-10 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
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
          ) : (
            <div className="col-span-full py-16 text-center rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
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
