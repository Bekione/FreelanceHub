"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Square,
  Pause,
  Clock,
  Calendar,
  History,
  Trash2,
  Plus,
  Download,
} from "lucide-react";
import { useDataStore } from "@/store/data-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/translation-context";

interface TimeEntry {
  id: string;
  project: string;
  description: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  date: string;
}

export function TimeTrackingContent() {
  const { projects } = useDataStore();
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<"timer" | "history">("timer");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeProject, setActiveProject] = useState("");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState<TimeEntry[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!activeProject) {
      toast.error(t("toasts.selectProjectFirst"));
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
    toast.success(t("toasts.timerStarted"), {
      description: `${t("toasts.trackingFor")} ${activeProject}`,
    });
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      project: activeProject,
      description: description || "No description",
      startTime: Date.now() - seconds * 1000,
      endTime: Date.now(),
      duration: seconds,
      date: new Date().toISOString(),
    };

    setHistory([newEntry, ...history]);
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setDescription("");
    toast.success(t("toasts.timeEntrySaved"), {
      description: `${t("toasts.loggedTo")} ${formatTime(seconds)} ${t("toasts.to")} ${activeProject}`,
    });
  };

  const totalTimeToday = history
    .filter(
      (entry) =>
        new Date(entry.date).toDateString() === new Date().toDateString(),
    )
    .reduce((sum, entry) => sum + entry.duration, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading">{t("timeTracking.title")}</h2>
          <p className="text-muted-foreground mt-1">
            {t("timeTracking.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg border border-border/50">
          <Button
            variant={activeTab === "timer" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("timer")}
            className="rounded-md h-8 text-xs px-4"
          >
            {t("timeTracking.timer")}
          </Button>
          <Button
            variant={activeTab === "history" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("history")}
            className="rounded-md h-8 text-xs px-4"
          >
            {t("timeTracking.history")}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "timer" ? (
          <motion.div
            key="timer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid gap-6 md:grid-cols-12"
          >
            <div className="md:col-span-8 space-y-6">
              <Card
                className={`relative overflow-hidden transition-colors duration-500 ${isRunning ? "border-primary/40 bg-primary/5" : ""}`}
              >
                {isRunning && (
                  <motion.div
                    className="absolute top-0 left-0 h-1 bg-primary"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}
                <CardHeader>
                  <CardTitle>{t("timeTracking.workingOn")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground ml-1">
                        {t("timeTracking.project")}
                      </label>
                      <Select
                        value={activeProject}
                        onValueChange={setActiveProject}
                        disabled={isRunning}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={t("timeTracking.selectProject")} />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.title}>
                              {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground ml-1">
                        {t("timeTracking.taskDescription")}
                      </label>
                      <Input
                        placeholder={t("timeTracking.descriptionPlaceholder")}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isRunning}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-10 space-y-8">
                    <div className="text-7xl font-mono font-bold tracking-tight text-primary tabular-nums">
                      {formatTime(seconds)}
                    </div>

                    <div className="flex items-center gap-4">
                      {!isRunning ? (
                        <Button
                          size="lg"
                          className="h-16 w-16 rounded-full shadow-lg"
                          onClick={handleStart}
                        >
                          <Play className="h-6 w-6 fill-current" />
                        </Button>
                      ) : (
                        <div className="flex items-center gap-6">
                          <Button
                            variant="secondary"
                            size="lg"
                            className="h-14 w-14 rounded-full shadow-sm"
                            onClick={handlePause}
                          >
                            {isPaused ? (
                              <Play className="h-5 w-5" />
                            ) : (
                              <Pause className="h-5 w-5" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="lg"
                            className="h-16 w-16 rounded-full shadow-lg"
                            onClick={handleStop}
                          >
                            <Square className="h-6 w-6 fill-current" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {t("timeTracking.todaySummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                      {t("timeTracking.totalTime")}
                    </p>
                    <p className="text-2xl font-bold font-mono">
                      {formatTime(totalTimeToday)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("timeTracking.recentLogs").toUpperCase()}
                    </p>
                    {history.slice(0, 3).length > 0 ? (
                      history.slice(0, 3).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex flex-col gap-1 p-2 rounded-lg border border-border/30 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold truncate">
                              {entry.project}
                            </span>
                            <span className="text-muted-foreground">
                              {formatTime(entry.duration)}
                            </span>
                          </div>
                          <span className="text-muted-foreground truncate">
                            {entry.description}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-center py-4 text-muted-foreground italic border border-dashed rounded-lg">
                        {t("timeTracking.noEntriesToday")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                <div>
                  <CardTitle>{t("timeTracking.timeLogHistory")}</CardTitle>
                  <CardDescription>
                    {t("timeTracking.reviewEntries")}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  {t("timeTracking.exportHistory")}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {history.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="text-sm font-semibold truncate max-w-[200px]">
                                {entry.project}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 py-0"
                              >
                                {entry.description}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <History className="h-3 w-3" />
                                {new Date(entry.startTime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}{" "}
                                -{" "}
                                {new Date(entry.endTime!).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold font-mono">
                              {formatTime(entry.duration)}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                              {t("timeTracking.logged")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center">
                      <Clock className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-muted-foreground">
                        {t("timeTracking.historyEmpty")}
                      </p>
                      <p className="text-sm text-muted-foreground/60 max-w-xs">
                        {t("timeTracking.emptySubtitle")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setActiveTab("timer")}
                    >
                      <Plus className="mr-2 h-4 w-4" /> {t("timeTracking.logCustomEntry")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
