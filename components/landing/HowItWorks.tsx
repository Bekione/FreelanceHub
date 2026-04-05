"use client";

import { motion } from "framer-motion";
import { UserPlus, ClipboardList, BarChart3 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { createT } from "@/lib/i18n/t";

interface HowItWorksProps {
  dict: Dictionary;
}

export default function HowItWorks({ dict }: HowItWorksProps) {
  const t = createT(dict);
  const steps = [
    { icon: UserPlus,      titleKey: "landing.howItWorks.step1Title", descKey: "landing.howItWorks.step1Desc" },
    { icon: ClipboardList, titleKey: "landing.howItWorks.step2Title", descKey: "landing.howItWorks.step2Desc" },
    { icon: BarChart3,     titleKey: "landing.howItWorks.step3Title", descKey: "landing.howItWorks.step3Desc" },
  ];

  return (
    <section className="py-24">
      <div className="container px-6 xl:px-[120px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            {t("landing.howItWorks.sectionTitle1")}{" "}
            <span className="text-gradient-primary">
              {t("landing.howItWorks.sectionTitle2")}
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-sm font-bold text-primary mb-2">
                {t("landing.howItWorks.step")} {i + 1}
              </div>
              <h3 className="text-lg font-semibold mb-2">{t(step.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
