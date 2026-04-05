"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import dashboardImg from "@/public/images/dashboard-preview.png";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { createT } from "@/lib/i18n/t";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

interface HeroProps {
  dict: Dictionary;
  lang: string;
}

export default function Hero({ dict, lang }: HeroProps) {
  const t = createT(dict);
  const badges = [
    t("landing.hero.badge1"),
    t("landing.hero.badge2"),
    t("landing.hero.badge3"),
  ];

  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <div
        className="absolute inset-x-0 top-0 h-[115svh] pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 50%, transparent 100%)",
        }}
      >
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4"
        />
      </div>

      <div className="container px-6 xl:px-[120px] mx-auto relative z-10">
        <motion.div
          {...fadeUp(0)}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {badges.map((badge) => (
            <span
              key={badge}
              className="bg-white/5 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-medium text-foreground/80 shadow-sm"
            >
              {badge}
            </span>
          ))}
        </motion.div>

        <motion.h1
          {...fadeUp(0.15)}
          className="text-5xl md:text-7xl lg:text-[80px] font-bold text-center leading-[1.05] tracking-tight max-w-4xl mx-auto font-heading"
        >
          {t("landing.hero.headline1")}{" "}
          <span className="text-gradient-primary">
            {t("landing.hero.headline2")}
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.3)}
          className="mt-6 text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto"
        >
          {t("landing.hero.subtext")}
        </motion.p>

        <motion.div
          {...fadeUp(0.45)}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          <a
            href="#pricing"
            className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            {t("landing.hero.ctaPrimary")}
          </a>
          <a
            href="#dashboard-preview"
            className="px-8 py-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md font-semibold text-foreground/90 hover:bg-white/10 transition-all shadow-sm"
          >
            {t("landing.hero.ctaSecondary")}
          </a>
        </motion.div>

        <motion.p
          {...fadeUp(0.55)}
          className="text-center text-sm text-muted-foreground mt-5"
        >
          {t("landing.hero.noCreditCard")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 2 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-16 max-w-5xl mx-auto relative"
          style={{ perspective: "1200px" }}
        >
          <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-3xl opacity-70 pointer-events-none" />
          <div className="relative rounded-2xl border border-foreground/2 shadow-2xl bg-background/20 backdrop-blur-md p-2">
            <div className="absolute inset-0 rounded-2xl border border-t-primary/30 pointer-events-none" />
            <div className="relative rounded-xl overflow-hidden border border-foreground/10 bg-black/40">
              <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
              <Image
                src={dashboardImg}
                alt="FreelanceHub Dashboard"
                className="w-full block opacity-80"
                priority
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp(0.7)}
          className="mt-20 flex justify-center items-center gap-12 opacity-40"
        >
          {["Stripe", "Notion", "Slack", "Figma", "GitHub"].map((name) => (
            <span
              key={name}
              className="text-sm font-medium text-muted-foreground tracking-wider uppercase"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
