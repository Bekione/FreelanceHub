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
  const [direction, setDirection] = useState(1);
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
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const handleNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Add a slight delay just to show the submitting state smoothly
    await new Promise((r) => setTimeout(r, 800));

    try {
      const savedPlan = localStorage.getItem("intended_plan") || "free";
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Append plan flag along with form data
        body: JSON.stringify({ ...formData, plan: savedPlan }),
      });

      if (!res.ok) throw new Error("Failed to save");

      // Apply theme preference just in case
      if (formData.themePreference === "Light") {
        setTheme("light");
      } else {
        setTheme("dark");
      }

      // Cleanup storage
      localStorage.removeItem("intended_plan");

      // Route to payment processing if Pro was explicitly chosen
      if (savedPlan === "pro") {
        router.push("/checkout");
      } else {
        router.push("/dashboard");
      }

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

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden bg-[#0A0A0A]">
      {/* Animated Glowing Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 100, -50, 0],
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center pt-16 pb-12 min-h-[550px] relative z-10 glass border border-white/5 rounded-3xl shadow-2xl px-6 overflow-hidden">
        {/* FreelanceHub Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <AppLogo className="scale-125 select-none" type="icon" />
        </motion.div>

        <div className="w-full flex-1 relative flex flex-col items-center">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
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
                      if (e.key === "Enter" && formData.name.trim())
                        handleNext();
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
                custom={direction}
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
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground",
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
                custom={direction}
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
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground",
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
                custom={direction}
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
                  className="rounded-full px-8 h-10 mt-4"
                >
                  Finish <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center justify-center min-h-[350px] absolute top-0"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                  Setting up your profile
                </h1>
                <p className="text-muted-foreground">Just a moment...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Dots */}
        {step < 4 && (
          <div className="flex gap-2 mt-auto pt-8 z-10 w-full justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step === i
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-border hover:bg-muted-foreground cursor-pointer",
                )}
                onClick={() => {
                  if (i === step) return;
                  setDirection(i > step ? 1 : -1);
                  setStep(i);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
