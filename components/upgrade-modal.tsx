"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: "clients" | "projects" | "invoices";
  limit?: number;
}

const RESOURCE_COPY: Record<string, { title: string; description: string }> = {
  clients: {
    title: "You've reached your client limit",
    description:
      "Free accounts can manage up to 10 clients. Upgrade to Pro for unlimited clients and premium features.",
  },
  projects: {
    title: "You've reached your project limit",
    description:
      "Free accounts can manage up to 15 projects. Upgrade to Pro for unlimited projects and file attachments.",
  },
  invoices: {
    title: "You've reached your monthly invoice limit",
    description:
      "Free accounts can create up to 20 invoices per month. Upgrade to Pro for unlimited invoices and custom branding.",
  },
  generic: {
    title: "This is a Pro feature",
    description:
      "Upgrade to FreelanceHub Pro to unlock this feature and take your freelance business to the next level.",
  },
};

const PRO_FEATURES = [
  "Unlimited clients, projects & invoices",
  "Custom branding on all invoices & emails",
  "Secure client portals",
  "Automated payment reminders",
  "Project file attachments",
  "Priority support",
];

export function UpgradeModal({ isOpen, onClose, resource }: UpgradeModalProps) {
  const router = useRouter();
  const copy = resource ? RESOURCE_COPY[resource] : RESOURCE_COPY.generic;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative bg-card border border-border shadow-2xl overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1 w-full bg-linear-to-r from-primary via-purple-500 to-primary" />

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-8 space-y-6">
                {/* Icon + Headline */}
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-none bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold font-heading">
                    {copy.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {copy.description}
                  </p>
                </div>

                {/* Feature list */}
                <ul className="space-y-2">
                  {PRO_FEATURES.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      onClose();
                      router.push("/checkout");
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade to Pro — $5/mo
                  </Button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
