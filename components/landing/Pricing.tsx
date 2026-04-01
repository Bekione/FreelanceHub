"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "Perfect for getting started",
    features: [
      "Up to 10 projects",
      "Basic invoicing",
      "Client management",
      "Community support",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$5",
    period: "/mo",
    desc: "For serious freelancers",
    features: [
      "Unlimited projects",
      "Advanced invoicing",
      "Revenue analytics",
      "Time tracking",
      "Priority support",
      "Custom branding",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
];

export default function Pricing() {
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
            Simple, Transparent{" "}
            <span className="text-gradient-primary">Pricing</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No hidden fees. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto h-full">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
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
                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              <div className="mt-6 mb-8">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`/register?plan=${plan.name.toLowerCase()}`}
                className={`block text-center w-full py-3 rounded-lg font-semibold text-sm transition-all mt-auto ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20"
                    : "glass text-foreground hover:bg-foreground/5"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
