"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, DollarSign, FolderOpen } from "lucide-react";
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
  DialogTrigger,
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

export function ProjectsContent() {
  const { projects, clients, addProject } = useDataStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client: "",
    deadline: "",
    budget: "",
    status: "pending" as Project["status"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      title: formData.title,
      description: formData.description,
      client: formData.client,
      deadline: formData.deadline,
      budget: Number.parseFloat(formData.budget),
      status: formData.status,
    });
    setFormData({
      title: "",
      description: "",
      client: "",
      deadline: "",
      budget: "",
      status: "pending",
    });
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Create a new project for your client.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Website Redesign"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project goals..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  value={formData.client}
                  onValueChange={(value) =>
                    setFormData({ ...formData, client: value })
                  }
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.company}>
                          {client.company}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No clients found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="5000"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="h-full group hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-lg leading-tight">
                      {project.title}
                    </CardTitle>
                    <Badge
                      variant={getStatusColor(project.status)}
                      className="capitalize shrink-0"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="pt-1">
                    {project.client}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3rem]">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between text-sm py-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
                      <span>{project.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              No projects yet
            </p>
            <p className="text-sm text-muted-foreground/60">
              Get started by adding your first project!
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
