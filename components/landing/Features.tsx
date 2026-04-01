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

const features = [
  {
    icon: FolderKanban,
    title: "Manage Projects",
    desc: "Organize tasks, deadlines, and deliverables in one place.",
  },
  {
    icon: Users,
    title: "Track Clients",
    desc: "Keep all client info, communications, and history organized.",
  },
  {
    icon: FileText,
    title: "Send Invoices",
    desc: "Generate professional invoices and get paid faster.",
  },
  {
    icon: TrendingUp,
    title: "Monitor Revenue",
    desc: "Real-time earnings analytics and financial insights.",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    desc: "Log hours effortlessly and bill clients accurately.",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    desc: "Enterprise-grade security to protect your business data.",
  },
];

export default function Features() {
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
            Everything You Need to{" "}
            <span className="text-gradient-primary">Succeed</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for freelancers who mean business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6 group hover:-translate-y-1 hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
