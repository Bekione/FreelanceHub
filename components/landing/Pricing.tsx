"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { createT } from "@/lib/i18n/t";

interface PricingProps {
  dict: Dictionary;
  lang: string;
}

export default function Pricing({ dict, lang }: PricingProps) {
  const t = createT(dict);
  const plans = [
    {
      nameKey: "landing.pricing.freeName",
      price: "$0",
      descKey: "landing.pricing.freeDesc",
      featureKeys: [
        "landing.pricing.freeFeature1",
        "landing.pricing.freeFeature2",
        "landing.pricing.freeFeature3",
        "landing.pricing.freeFeature4",
      ],
      ctaKey: "landing.pricing.freeCta",
      highlight: false,
      plan: "free",
    },
    {
      nameKey: "landing.pricing.proName",
      price: "$5",
      periodKey: "landing.pricing.perMonth",
      descKey: "landing.pricing.proDesc",
      featureKeys: [
        "landing.pricing.proFeature1",
        "landing.pricing.proFeature2",
        "landing.pricing.proFeature3",
        "landing.pricing.proFeature4",
        "landing.pricing.proFeature5",
        "landing.pricing.proFeature6",
      ],
      ctaKey: "landing.pricing.proCta",
      highlight: true,
      plan: "pro",
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="container px-6 xl:px-[120px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            {t("landing.pricing.sectionTitle1")}{" "}
            <span className="text-gradient-primary">
              {t("landing.pricing.sectionTitle2")}
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("landing.pricing.sectionSubtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto h-full">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.nameKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`rounded-2xl p-8 flex flex-col h-full ${
                plan.highlight
                  ? "bg-primary/8 border-2 border-primary/30 glow-primary"
                  : "glass"
              }`}
            >
              {plan.highlight && (
                <span className="inline-block px-3 py-1 rounded-full w-fit bg-primary/20 text-primary text-xs font-bold mb-4">
                  {t("landing.pricing.mostPopular")}
                </span>
              )}
              <h3 className="text-2xl font-bold">{t(plan.nameKey)}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t(plan.descKey)}</p>
              <div className="mt-6 mb-8">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.periodKey && (
                  <span className="text-muted-foreground">{t(plan.periodKey)}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.featureKeys.map((fk) => (
                  <li key={fk} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{t(fk)}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`/${lang}/register?plan=${plan.plan}`}
                className={`block text-center w-full py-3 rounded-lg font-semibold text-sm transition-all mt-auto ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20"
                    : "glass text-foreground hover:bg-foreground/5"
                }`}
              >
                {t(plan.ctaKey)}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
