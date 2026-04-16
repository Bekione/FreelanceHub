"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatusContext } from "@/contexts/network-status-context";
import { useTranslation } from "@/lib/i18n/translation-context";

export function OfflineBanner() {
  const { isOnline, wasOffline, justReconnected } = useNetworkStatusContext();
  const [mounted, setMounted] = useState(false);
  const t = useTranslation();

  const showOffline = !isOnline;
  const showReconnected = isOnline && wasOffline && justReconnected;
  const visible = showOffline || showReconnected;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={showOffline ? "offline" : "reconnected"}
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-9999 flex items-center justify-center"
        >
          <div
            className={`flex items-center gap-2.5 px-5 py-2.5 shadow-lg text-sm font-medium backdrop-blur-md border-b border-x ${
              showOffline
                ? "bg-destructive/15 border-destructive/20 text-destructive"
                : "bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
            }`}
          >
            {showOffline ? (
              <>
                <WifiOff className="w-4 h-4 shrink-0" />
                <span>
                  {t("offline.offlineMessage")}
                </span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 shrink-0" />
                <span>{t("offline.backOnline")}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
