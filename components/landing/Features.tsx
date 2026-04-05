"use client";

import { motion } from "framer-motion";
import {
  FolderKanban,
  Users,
  FileText,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { createT } from "@/lib/i18n/t";

interface FeaturesProps {
  dict: Dictionary;
}

export default function Features({ dict }: FeaturesProps) {
  const t = createT(dict);
  const features = [
    { icon: FolderKanban, titleKey: "landing.features.manageProjects", descKey: "landing.features.manageProjectsDesc" },
    { icon: Users,        titleKey: "landing.features.trackClients",   descKey: "landing.features.trackClientsDesc" },
    { icon: FileText,     titleKey: "landing.features.sendInvoices",   descKey: "landing.features.sendInvoicesDesc" },
    { icon: TrendingUp,   titleKey: "landing.features.monitorRevenue", descKey: "landing.features.monitorRevenueDesc" },
    { icon: Clock,        titleKey: "landing.features.timeTracking",   descKey: "landing.features.timeTrackingDesc" },
    { icon: Shield,       titleKey: "landing.features.secureAuth",     descKey: "landing.features.secureAuthDesc" },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="container px-6 xl:px-[120px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            {t("landing.features.sectionTitle1")}{" "}
            <span className="text-gradient-primary">
              {t("landing.features.sectionTitle2")}
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("landing.features.sectionSubtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6 group hover:-translate-y-1 hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t(f.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
