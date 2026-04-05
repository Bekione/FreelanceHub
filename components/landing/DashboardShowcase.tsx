"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import dashboardImg from "@/public/images/dashboard-preview.png";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { createT } from "@/lib/i18n/t";

interface DashboardShowcaseProps {
  dict: Dictionary;
}

export default function DashboardShowcase({ dict }: DashboardShowcaseProps) {
  const t = createT(dict);

  const labels = [
    { textKey: "landing.showcase.labelKpi",      top: "12%", left: "25%" },
    { textKey: "landing.showcase.labelRevenue",  top: "55%", left: "35%" },
    { textKey: "landing.showcase.labelProjects", top: "45%", right: "8%" },
    { textKey: "landing.showcase.labelNav",      top: "30%", left: "2%" },
  ];

  return (
    <section id="dashboard-preview" className="py-24 relative">
      <div className="container px-6 xl:px-[120px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            {t("landing.showcase.headline1")}{" "}
            <span className="text-gradient-primary">
              {t("landing.showcase.headline2")}
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("landing.showcase.subtext")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl border border-foreground/10 shadow-2xl bg-background/20 backdrop-blur-md p-2 glow-primary">
            <div className="absolute inset-0 rounded-2xl border border-t-primary/30 pointer-events-none" />
            <div className="relative rounded-xl overflow-hidden border border-foreground/10 bg-black/40">
              <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
              <Image
                src={dashboardImg}
                alt="FreelanceHub Dashboard Overview"
                className="w-full block opacity-[0.85]"
              />
            </div>
          </div>

          {labels.map((label, i) => (
            <motion.div
              key={label.textKey}
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
              className="absolute hidden lg:flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-md shadow-lg shadow-black/20 px-3 py-1.5 rounded-full text-xs font-medium text-white pointer-events-none"
              style={{ top: label.top, left: label.left, right: label.right }}
            >
              <span className="w-2 h-2 rounded-full bg-primary" />
              {t(label.textKey)}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
