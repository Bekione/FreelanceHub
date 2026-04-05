"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { createT } from "@/lib/i18n/t";

interface FinalCTAProps {
  dict: Dictionary;
}

export default function FinalCTA({ dict }: FinalCTAProps) {
  const t = createT(dict);
  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/6 blur-[120px]" />
      </div>
      <div className="container px-6 xl:px-[120px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            {t("landing.cta.headline1")}{" "}
            <span className="text-gradient-primary">
              {t("landing.cta.headline2")}
            </span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            {t("landing.cta.subtext")}
          </p>
          <a
            href="#pricing"
            className="inline-flex mt-8 px-10 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:brightness-110 transition-all"
          >
            {t("landing.cta.button")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
