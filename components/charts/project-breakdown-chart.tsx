"use client";

import { useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTheme } from "@/components/theme-provider";

ChartJS.register(ArcElement, Tooltip, Legend);

function getCSSColor(variable: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  if (!raw) return fallback;
  const parts = raw.split(/[\s,]+/).map((v) => parseFloat(v.replace("%", "")));
  if (parts.length < 3 || parts.some(isNaN)) return fallback;
  const h = parts[0] / 360;
  const s = parts[1] / 100;
  const l = parts[2] / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const FALLBACKS = {
  light: {
    primary: "#7c3aed",
    active: "#3b82f6",
    completed: "#10b981",
    pending: "#f59e0b",
    archived: "#e4e4e7",
    background: "#ffffff",
    popover: "#ffffff",
    foreground: "#09090b",
    border: "#e4e4e7",
  },
  dark: {
    primary: "#a78bfa",
    active: "#60a5fa",
    completed: "#34d399",
    pending: "#fbbf24",
    archived: "#27272a",
    background: "#09090b",
    popover: "#020817",
    foreground: "#fafafa",
    border: "#27272a",
  },
};

export default function ProjectBreakdownChart({
  rawData,
}: {
  rawData: { status: string; count: number }[];
}) {
  const { theme } = useTheme();
  const chartRef = useRef<ChartJS<"doughnut"> | null>(null);

  const getColors = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const fb = isDark ? FALLBACKS.dark : FALLBACKS.light;
    return {
      active: getCSSColor("--ring", fb.active), // fallback map
      completed: fb.completed,
      pending: fb.pending,
      archived: fb.border,
      background: getCSSColor("--background", fb.background),
      popover: getCSSColor("--popover", fb.background),
      foreground: getCSSColor("--foreground", fb.foreground),
      primary: getCSSColor("--primary", fb.primary),
      border: getCSSColor("--border", fb.border),
    };
  };

  useEffect(() => {
    const update = () => {
      if (chartRef.current) chartRef.current.update("none");
    };
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [theme]);

  const initial = typeof window !== "undefined" ? getColors() : FALLBACKS.light;

  // We map the rawData into consistent categories
  const categories = ["ACTIVE", "COMPLETED", "PENDING", "ARCHIVED"];
  const dataPoints = categories.map((cat) => {
    const found = rawData.find((d) => d.status === cat);
    return found ? found.count : 0;
  });

  const data = {
    labels: ["  Active", "  Completed", "  Pending", "  Archived"],
    datasets: [
      {
        data: dataPoints,
        backgroundColor: [
          initial.active,
          initial.completed,
          initial.pending,
          initial.archived,
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const isDark =
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false;

  const options = {
    layout: {
      padding: { bottom: 16 },
    },
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: initial.foreground,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          padding: 24,
          font: { size: 13 },
        },
      },
      tooltip: {
        backgroundColor: initial.popover,
        titleColor: initial.foreground,
        bodyColor: initial.foreground,
        borderColor: initial.border,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 0,
      },
    },
  };

  if (dataPoints.every((v) => v === 0)) {
    return (
      <div className="text-sm text-muted-foreground flex h-full items-center justify-center">
        No project data available
      </div>
    );
  }

  return (
    <div className="h-full w-full max-h-[220px]">
      <Doughnut ref={chartRef} data={data} options={options} />
    </div>
  );
}
