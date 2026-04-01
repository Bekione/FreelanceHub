"use client";

import { motion } from "framer-motion";

export default function FinalCTA() {
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
            Take Control of Your Freelance Business{" "}
            <span className="text-gradient-primary">Today</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Join thousands of freelancers who've streamlined their workflow with
            FreelanceHub.
          </p>
          <a
            href="#pricing"
            className="inline-flex mt-8 px-10 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:brightness-110 transition-all"
          >
            Start for Free
          </a>
        </motion.div>
      </div>
    </section>
  );
}
