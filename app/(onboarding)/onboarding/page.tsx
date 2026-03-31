"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  FileText,
  Video,
  Smartphone,
  Moon,
  Search,
  Code2,
  Briefcase,
  Megaphone,
  MoreHorizontal,
  PenTool,
  User,
  Users,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "Web Development", icon: Code2 },
  { id: "Mobile App Dev", icon: Smartphone },
  { id: "UI/UX Design", icon: PenTool },
  { id: "Marketing", icon: Megaphone },
  { id: "Writing & Translation", icon: FileText },
  { id: "Video & Animation", icon: Video },
  { id: "Consulting", icon: Briefcase },
  { id: "Other", icon: MoreHorizontal },
];

const COMPANY_SIZES = [
  { id: "Full-time Freelancing", icon: Briefcase },
  { id: "Side Hustle", icon: Moon },
  { id: "Growing an Agency", icon: Users },
  { id: "Just exploring", icon: Search },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { setTheme } = useTheme();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    companySize: "",
    themePreference: "Dark",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.name && !formData.name) {
      setFormData((prev) => ({ ...prev, name: session.user.name }));
    }
  }, [session, formData.name]);

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  const handleNext = () => setStep((s) => s + 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Add a slight delay just to show the submitting state smoothly
    await new Promise((r) => setTimeout(r, 800));

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");

      // Apply theme preference just in case
      if (formData.themePreference === "Light") {
        setTheme("light");
      } else {
        setTheme("dark");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast.error("Something went wrong");
      setIsSubmitting(false);
      setStep(3); // Go back to last interactive step
    }
  };

  const submitIfLast = () => {
    if (step === 3) {
      setStep(4);
      handleSubmit();
    } else {
      handleNext();
    }
  };

  if (step === 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mb-4" />
        <p className="text-zinc-400 font-medium">Submitting...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center pt-20 pb-16 min-h-[600px]">
      {/* FreelanceHub Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <AppLogo className="scale-125 select-none" type="icon" />
      </motion.div>

      <div className="w-full flex-1 relative flex flex-col items-center">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full max-w-md flex flex-col items-center text-center space-y-8 absolute top-0"
            >
              <h1 className="text-3xl font-bold tracking-tight">
                What's your name?
              </h1>
              <div className="w-full space-y-2 text-left">
                <label className="text-sm font-medium text-foreground">
                  Full name
                </label>
                <Input
                  autoFocus
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-background h-12 text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && formData.name.trim()) handleNext();
                  }}
                />
              </div>
              <Button
                onClick={handleNext}
                disabled={!formData.name.trim()}
                className="rounded-full px-8 h-10"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center text-center space-y-8 absolute top-0"
            >
              <h1 className="text-3xl font-bold tracking-tight">
                What describes your freelance work?
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => {
                        setFormData({ ...formData, role: role.id });
                        setTimeout(handleNext, 300); // Auto-advance
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md transform scale-95"
                          : "border-border bg-card hover:bg-accent hover:border-accent-foreground/20",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          isSelected ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium text-center leading-tight",
                          isSelected
                            ? "text-primary font-semibold"
                            : "text-foreground",
                        )}
                      >
                        {role.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center text-center space-y-8 absolute top-0"
            >
              <h1 className="text-3xl font-bold tracking-tight">
                What's your primary goal?
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {COMPANY_SIZES.map((size) => {
                  const Icon = size.icon;
                  const isSelected = formData.companySize === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => {
                        setFormData({ ...formData, companySize: size.id });
                        setTimeout(handleNext, 300); // Auto-advance
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md transform scale-95"
                          : "border-border bg-card hover:bg-accent hover:border-accent-foreground/20",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          isSelected ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium text-center leading-tight",
                          isSelected
                            ? "text-primary font-semibold"
                            : "text-foreground",
                        )}
                      >
                        {size.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center text-center space-y-8 absolute top-0"
            >
              <h1 className="text-3xl font-bold tracking-tight">
                Pick your style
              </h1>
              <div className="flex gap-6 max-w-lg w-full justify-center">
                <button
                  onClick={() =>
                    setFormData({ ...formData, themePreference: "Light" })
                  }
                  className={cn(
                    "flex-1 aspect-4/3 rounded-2xl border overflow-hidden relative transition-all duration-200",
                    formData.themePreference === "Light"
                      ? "border-primary shadow-lg ring-1 ring-primary"
                      : "border-border opacity-70 hover:opacity-100 bg-card",
                  )}
                >
                  <div className="absolute inset-0 bg-white p-4 flex flex-col gap-2">
                    <AppLogo type="icon" className="w-4 h-4 mb-2" />
                    <div className="w-3/4 h-3 bg-zinc-200 rounded" />
                    <div className="w-1/2 h-3 bg-zinc-200 rounded" />
                    <div className="w-full h-full bg-zinc-100 rounded-md mt-2" />
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 text-center font-bold text-zinc-900 border-t pt-4 bg-white/50 backdrop-blur-sm">
                    Light
                  </div>
                </button>

                <button
                  onClick={() =>
                    setFormData({ ...formData, themePreference: "Dark" })
                  }
                  className={cn(
                    "flex-1 aspect-4/3 rounded-2xl border overflow-hidden relative transition-all duration-200",
                    formData.themePreference === "Dark"
                      ? "border-primary shadow-lg ring-1 ring-primary"
                      : "border-border opacity-70 hover:opacity-100 bg-card",
                  )}
                >
                  <div className="absolute inset-0 bg-zinc-950 p-4 flex flex-col gap-2">
                    <AppLogo type="icon" className="w-4 h-4 mb-2" />
                    <div className="w-3/4 h-3 bg-zinc-800 rounded" />
                    <div className="w-1/2 h-3 bg-zinc-800 rounded" />
                    <div className="w-full h-full bg-zinc-900 rounded-md mt-2" />
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 text-center font-bold text-zinc-100 border-t border-zinc-800 pt-4 bg-zinc-950/50 backdrop-blur-sm">
                    Dark
                  </div>
                </button>
              </div>

              <Button
                onClick={submitIfLast}
                className="rounded-full px-8 h-10 mt-8"
              >
                Finish <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2 mt-auto pt-8 z-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step === i
                ? "w-4 bg-primary"
                : "w-1.5 bg-border hover:bg-muted-foreground cursor-pointer",
            )}
            onClick={() => step > i && setStep(i)}
          />
        ))}
      </div>
    </div>
  );
}
