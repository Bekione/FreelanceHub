"use client";

import { motion } from "framer-motion";
import { UserPlus, ClipboardList, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Add Clients & Projects",
    desc: "Onboard clients and set up projects in seconds.",
  },
  {
    icon: ClipboardList,
    title: "Track Work & Invoice",
    desc: "Log time, create invoices, and send them instantly.",
  },
  {
    icon: BarChart3,
    title: "Analyze Earnings",
    desc: "See your revenue grow with real-time analytics.",
  },
];

export default function HowItWorks() {
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
            How It <span className="text-gradient-primary">Works</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
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
                Step {i + 1}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
