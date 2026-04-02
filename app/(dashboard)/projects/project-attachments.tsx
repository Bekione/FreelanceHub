"use client";

import { useState, useRef } from "react";
import { useDataStore, type Attachment } from "@/store/data-store";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Paperclip,
  Trash2,
  File,
  UploadCloud,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";

const getFriendlyFiletype = (mimeType: string | null, filename: string) => {
  if (!mimeType) return filename.split(".").pop()?.toUpperCase() || "FILE";
  const type = mimeType.toLowerCase();

  if (type.includes("spreadsheetml") || type.includes("excel")) return "EXCEL";
  if (type.includes("wordprocessingml") || type.includes("word")) return "WORD";
  if (type.includes("presentationml") || type.includes("powerpoint"))
    return "POWERPOINT";
  if (type.includes("pdf")) return "PDF";
  if (type.includes("zip")) return "ZIP";
  if (type.includes("image/")) return "IMAGE";
  if (type.includes("text/")) return "TEXT";

  return filename.split(".").pop()?.toUpperCase() || "FILE";
};

export function ProjectAttachments({
  projectId,
  attachments = [],
  onAttachmentChange,
}: {
  projectId: string;
  attachments?: Attachment[];
  onAttachmentChange?: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchProjects = useDataStore((s) => s.fetchProjects);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("intent", "attachment");
    formData.append("projectId", projectId);

    try {
      const res = await fetch("/api/upload?intent=attachment", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errMessage = "Upload failed.";
        if (res.status === 413) {
          errMessage = "File is too large.";
        } else {
          try {
            const data = await res.json();
            errMessage = data.error || errMessage;
          } catch {}
        }
        throw new Error(errMessage);
      }

      toast.success("Attachment added");
      await fetchProjects({ limit: 9 }); // Refresh data store to get new attachment
      onAttachmentChange?.();
    } catch (err: any) {
      toast.error("Upload error", {
        description: err.message || "Something went wrong",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete attachment");
      toast.success("Attachment removed");
      await fetchProjects({ limit: 9 }); // Refresh
      onAttachmentChange?.();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleForceDownload = async (
    e: React.MouseEvent,
    url: string,
    filename: string,
  ) => {
    e.preventDefault();
    const loadingToast = toast.loading(`Downloading ${filename}...`);
    try {
      // Proxy download via client-side fetch bypasses cross-origin limitations
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      toast.success("Download complete", { id: loadingToast });
    } catch (err) {
      toast.dismiss(loadingToast);
      // Fallback: open in new tab if CORS prevents blob fetch
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Attachments
          <span className="text-muted-foreground text-xs font-normal">
            ({attachments.length})
          </span>
        </h4>
        <div>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Upload File
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {attachments.length === 0 && !isUploading && (
          <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
            <Paperclip className="h-6 w-6 mx-auto mb-2 opacity-30" />
            No attachments yet. Add project briefs, contracts, or reference
            files here.
          </div>
        )}

        {attachments.map((file) => (
          <div
            key={file.id}
            className="relative flex items-center justify-between p-3 border rounded-md group bg-card transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
              <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                <File className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <a
                  href={file.url}
                  onClick={(e) => handleForceDownload(e, file.url, file.name)}
                  className="text-sm font-medium hover:underline truncate block text-primary"
                  title={file.name}
                >
                  {file.name}
                </a>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                  <span className="opacity-50 mx-1">•</span>
                  {getFriendlyFiletype(file.mimeType, file.name)}
                </p>
              </div>
            </div>
            {confirmDeleteId === file.id ? (
              <div className="absolute right-3 z-10 flex items-center gap-1 shrink-0 animate-in fade-in zoom-in-95 duration-150">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deletingId === file.id}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleDelete(file.id)}
                  disabled={deletingId === file.id}
                >
                  {deletingId === file.id ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  Confirm
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmDeleteId(file.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
