"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  DollarSign,
  FolderOpen,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { useDataStore, type Project } from "@/store/data-store";
import { Button } from "@/components/ui/button";
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

type ProjectStatus = Project["status"];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
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

const emptyForm = {
  title: "",
  description: "",
  clientId: "",
  deadline: "",
  budget: "",
  bonus: "",
  platform: "",
  status: "PENDING" as ProjectStatus,
};

export function ProjectsContent() {
  const {
    projects,
    clients,
    isLoadingProjects,
    fetchProjects,
    fetchClients,
    createProject,
    updateProject,
    deleteProject,
  } = useDataStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    fetchProjects();
    fetchClients();
  }, [fetchProjects, fetchClients]);

  const openCreate = () => {
    setEditingProject(null);
    reset(emptyForm);
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
      budget: project.budget?.toString() ?? "",
      bonus: project.bonus?.toString() ?? "",
      platform: project.platform ?? "",
      status: project.status,
    });
    setIsFormOpen(true);
  };
  const openDelete = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (data: typeof emptyForm) => {
    const payload = {
      ...data,
      clientId: data.clientId || undefined,
      budget: data.budget ? parseFloat(data.budget) : null,
      bonus: data.bonus ? parseFloat(data.bonus) : null,
    };
    const result = editingProject
      ? await updateProject(editingProject.id, payload)
      : await createProject(payload);
    if (result.error) {
      toast.error("Failed", { description: result.error });
      return;
    }
    toast.success(editingProject ? "Project updated" : "Project created");
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    const result = await deleteProject(deletingProject.id);
    setIsDeleting(false);
    if (result.error) {
      toast.error("Cannot delete project", { description: result.error });
      setIsDeleteOpen(false);
      return;
    }
    toast.success("Project deleted");
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading">Projects</h2>
          <p className="text-muted-foreground mt-1">
            Manage your client projects and track progress.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      {isLoadingProjects ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="h-full group hover:shadow-md transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base leading-tight truncate">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="pt-0.5">
                          {project.client?.name ?? "No client"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge
                          variant={statusVariant(project.status)}
                          className="capitalize text-xs"
                        >
                          {project.status.toLowerCase()}
                        </Badge>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {project.description || "No description."}
                    </p>
                    <div className="space-y-2">
                      {project.platform && (
                        <p className="text-xs text-muted-foreground">
                          Via{" "}
                          <span className="font-medium text-foreground">
                            {project.platform}
                          </span>
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm py-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {project.deadline
                              ? new Date(project.deadline).toLocaleDateString()
                              : "No deadline"}
                          </span>
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
          ) : (
            <div className="col-span-full py-16 text-center rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
              <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                No projects yet
              </p>
              <p className="text-sm text-muted-foreground/60">
                Get started by creating your first project!
              </p>
              <Button variant="outline" className="mt-4" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Project
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "New Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? "Update project details."
                : "Create a new project for your work."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Website Redesign"
                {...register("title", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the project goals..."
                {...register("description")}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select
                  value={watch("clientId")}
                  onValueChange={(v) =>
                    setValue("clientId", v === "none" ? "" : v, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
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
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" {...register("deadline")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="5000"
                  {...register("budget")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus">Bonus ($)</Label>
                <Input
                  id="bonus"
                  type="number"
                  placeholder="0"
                  {...register("bonus")}
                />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={watch("platform")}
                  onValueChange={(v) =>
                    setValue("platform", v === "none" ? "" : v, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where from?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {PLATFORM_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {editingProject ? "Save Changes" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingProject?.title}</strong>? This cannot be undone.
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
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
