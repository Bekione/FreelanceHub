"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/translation-context";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: "clients" | "projects" | "invoices" | "portals" | "language";
  limit?: number;
}

export function UpgradeModal({ isOpen, onClose, resource }: UpgradeModalProps) {
  const router = useRouter();
  const t = useTranslation();

  const getCopy = () => {
    switch (resource) {
      case "clients":
        return { title: t("upgrade.clients.title"), description: t("upgrade.clients.description") };
      case "projects":
        return { title: t("upgrade.projects.title"), description: t("upgrade.projects.description") };
      case "invoices":
        return { title: t("upgrade.invoices.title"), description: t("upgrade.invoices.description") };
      case "portals":
        return { title: t("upgrade.portals.title"), description: t("upgrade.portals.description") };
      case "language":
        return { title: t("upgrade.language.title"), description: t("upgrade.language.description") };
      default:
        return { title: t("upgrade.title"), description: t("upgrade.description") };
    }
  };

  const copy = getCopy();

  const proFeatures = [
    t("upgrade.proFeatures.unlimited"),
    t("upgrade.proFeatures.branding"),
    t("upgrade.proFeatures.portals"),
    t("upgrade.proFeatures.reminders"),
    t("upgrade.proFeatures.attachments"),
    t("upgrade.proFeatures.support"),
  ];

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
                  {proFeatures.map((feat) => (
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
                    {t("upgrade.upgradePro")}
                  </Button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    {t("upgrade.maybeLater")}
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
