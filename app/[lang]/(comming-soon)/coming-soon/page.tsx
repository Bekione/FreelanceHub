"use client";

import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/coming-soon/ui/BackgroundBeams";
import SocialLinks from "@/components/coming-soon/SocialLinks";
import { Cover } from "@/components/coming-soon/ui/Cover";
import SubscriptionForm from "@/components/coming-soon/SubscriptionForm";
import CountdownTimer from "@/components/coming-soon/CountdownTimer";
import { AppLogo } from "@/components/app-logo";

export default function ComingSoonPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-between py-4 bg-background antialiased">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-violet-500/8 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 w-full my-3 flex justify-center"
      >
        <AppLogo />
      </motion.div>

      <div className="max-w-3xl mx-auto flex-1 flex flex-col items-center justify-center p-4 z-10 w-full gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center flex flex-col justify-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold w-full mx-auto text-center tracking-tight text-foreground">
            We are{" "}
            <Cover className="text-white px-2 rounded-lg leading-tight block sm:inline-block">
              cooking
            </Cover>{" "}
            our website.
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            A premium experience is on the way. Join the waitlist to get early
            access when we launch.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full"
        >
          <CountdownTimer targetDate="2026-05-10 10:00:00" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full px-4 z-10 mb-2"
      >
        <SubscriptionForm />
      </motion.div>

      <div className="z-10 pb-2">
        <SocialLinks />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      >
        <BackgroundBeams />
      </motion.div>
    </div>
  );
}
