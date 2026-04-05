"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { createT } from "@/lib/i18n/t";

interface TestimonialsProps {
  dict: Dictionary;
}

export default function Testimonials({ dict }: TestimonialsProps) {
  const t = createT(dict);
  const testimonials = [
    { name: "Sarah Chen",       avatarKey: "SC", quoteKey: "landing.testimonials.quote1", roleKey: "landing.testimonials.role1" },
    { name: "Marcus Johnson",   avatarKey: "MJ", quoteKey: "landing.testimonials.quote2", roleKey: "landing.testimonials.role2" },
    { name: "Elena Rodriguez",  avatarKey: "ER", quoteKey: "landing.testimonials.quote3", roleKey: "landing.testimonials.role3" },
  ];

  return (
    <section id="testimonials" className="py-24">
      <div className="container px-6 xl:px-[120px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            {t("landing.testimonials.sectionTitle1")}{" "}
            <span className="text-gradient-primary">
              {t("landing.testimonials.sectionTitle2")}
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                "{t(item.quoteKey)}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {item.avatarKey}
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{t(item.roleKey)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
