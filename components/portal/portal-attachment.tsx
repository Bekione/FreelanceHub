"use client";

import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

export function PortalAttachment({
  att,
  icon,
}: {
  att: { id: string; name: string; url: string; mimeType: string | null };
  icon: React.ReactNode;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isNewPreview, setIsNewPreview] = useState(false);
  const [hovered, setHovered] = useState(false);

  const extMatch = att.url.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch ? `.${extMatch[1]}` : "";
  const nameBase =
    ext && att.name.toLowerCase().endsWith(ext.toLowerCase())
      ? att.name.slice(0, -ext.length)
      : att.name;

  const fullName = nameBase + ext;
  const isLong = fullName.length > 50;

  useEffect(() => {
    if (previewOpen && isLong) {
      setIsNewPreview(true);
      const timer = setTimeout(() => setIsNewPreview(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [previewOpen, isLong]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    const tId = toast.loading(`Downloading ${att.name}...`);
    try {
      const res = await fetch(`/api/attachments/${att.id}/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.name;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download complete", { id: tId });
    } catch (err) {
      toast.error("Failed to download file.", { id: tId });
    }
  };

  const canPreview =
    att.mimeType?.startsWith("image/") ||
    att.mimeType?.includes("pdf") ||
    att.mimeType?.startsWith("video/") ||
    att.mimeType?.startsWith("audio/");

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border border-border/40 rounded-lg text-sm group">
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          {icon}
          <span className="font-medium truncate block pb-0.5" title={att.name}>
            {att.name}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {canPreview && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setPreviewOpen(true)}
              title="Preview file"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          <a
            href={`/api/attachments/${att.id}/download`}
            onClick={handleDownload}
            className="flex items-center justify-center h-7 w-7 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Download file"
            download
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0 overflow-hidden border-border/50 gap-0">
          <DialogHeader
            className="p-4 border-b shrink-0 bg-background z-10 m-0 overflow-hidden relative"
            style={{ containerType: "inline-size" }}
            onMouseEnter={() => isLong && setHovered(true)}
            onMouseLeave={() => isLong && setHovered(false)}
          >
            <DialogTitle className="font-medium text-lg leading-tight whitespace-nowrap overflow-hidden">
              <div
                className="inline-flex items-center w-full will-change-transform"
                style={{
                  width: hovered || isNewPreview ? "max-content" : "100%",
                  animation:
                    isNewPreview && isLong && !hovered
                      ? "slide-back-forth 8s linear 1 forwards"
                      : hovered && isLong
                        ? "slide-back-forth 8s linear infinite"
                        : undefined,
                }}
              >
                <div
                  className={hovered || isNewPreview ? "" : "truncate"}
                  style={{
                    maxWidth:
                      hovered || isNewPreview ? "none" : "calc(100cqw - 5rem)",
                  }}
                >
                  {nameBase}
                </div>
                <div className="shrink-0">{ext}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes slide-back-forth {
              0% { transform: translateX(0); }
              30% { transform: translateX(min(0px, calc(100cqw - 100% - 32px))); }
              60% { transform: translateX(min(0px, calc(100cqw - 100% - 32px))); }
              100% { transform: translateX(0); }
            }
          `,
            }}
          />
          <div className="flex-1 min-h-0 bg-muted/30 p-4 flex items-center justify-center overflow-hidden relative">
            {att.mimeType?.startsWith("image/") && (
              <img
                src={att.url}
                alt={att.name}
                className="max-w-full max-h-full object-contain rounded-md shadow-md"
              />
            )}
            {att.mimeType?.includes("pdf") && (
              <iframe
                src={att.url}
                className="w-full h-full rounded-md shadow-md bg-white border-0"
                title={att.name}
              />
            )}
            {att.mimeType?.startsWith("video/") && (
              <video
                src={att.url}
                controls
                className="max-w-full max-h-full rounded-md shadow-md"
              />
            )}
            {att.mimeType?.startsWith("audio/") && (
              <audio
                src={att.url}
                controls
                className="w-full max-w-md shadow-sm rounded-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
