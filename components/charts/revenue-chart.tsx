"use client";

import { useEffect, useRef, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "@/components/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { invoicesQueryOptions } from "@/lib/queries/invoices";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

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
    background: "#ffffff",
    popover: "#ffffff",
    foreground: "#09090b",
    muted: "#71717a",
    border: "#e4e4e7",
  },
  dark: {
    primary: "#a78bfa",
    background: "#09090b",
    popover: "#020817",
    foreground: "#fafafa",
    muted: "#a1a1aa",
    border: "#27272a",
  },
};

// Build an array of the last N month labels + Date ranges
function getLast6Months() {
  const months: { label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const label = d.toLocaleString("default", { month: "short" });
    months.push({ label, start, end });
  }
  return months;
}

export default function RevenueChart() {
  const { theme } = useTheme();
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const { data: invoicesData } = useQuery(invoicesQueryOptions({ limit: 500 }));
  const invoices = invoicesData?.data ?? [];

  // Compute monthly revenue from PAID invoices grouped by issue date
  const { labels, dataPoints } = useMemo(() => {
    const months = getLast6Months();
    const labels = months.map((m) => m.label);
    const dataPoints = months.map(({ start, end }) =>
      invoices
        .filter((inv) => {
          if (inv.status !== "PAID") return false;
          const d = new Date(inv.issueDate);
          return d >= start && d <= end;
        })
        .reduce((sum, inv) => sum + inv.amount, 0),
    );
    return { labels, dataPoints };
  }, [invoices]);

  const getColors = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const fb = isDark ? FALLBACKS.dark : FALLBACKS.light;
    return {
      primary: getCSSColor("--primary", fb.primary),
      background: getCSSColor("--background", fb.background),
      popover: getCSSColor("--popover", fb.background),
      foreground: getCSSColor("--foreground", fb.foreground),
      muted: getCSSColor("--muted-foreground", fb.muted),
      border: getCSSColor("--border", fb.border),
    };
  };

  useEffect(() => {
    const update = () => {
      const chart = chartRef.current;
      if (!chart) return;
      const c = getColors();
      const dataset = chart.data.datasets[0];
      dataset.borderColor = c.primary;
      dataset.pointBackgroundColor = c.primary;
      dataset.pointBorderColor = c.background;
      dataset.pointHoverBackgroundColor = c.primary;
      dataset.pointHoverBorderColor = c.background;
      const { ctx, chartArea } = chart;
      if (chartArea) {
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom,
        );
        gradient.addColorStop(0, c.primary + "40");
        gradient.addColorStop(1, c.primary + "00");
        dataset.backgroundColor = gradient as unknown as string;
      }
      const xScale = chart.options.scales?.x;
      const yScale = chart.options.scales?.y;
      if (xScale?.ticks) xScale.ticks.color = c.muted;
      if (xScale?.border)
        (xScale.border as Record<string, unknown>).color = c.border;
      if (yScale?.ticks) yScale.ticks.color = c.muted;
      if (yScale?.grid) yScale.grid.color = c.border + "40";
      if (chart.options.plugins?.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = c.popover;
        chart.options.plugins.tooltip.titleColor = c.foreground;
        chart.options.plugins.tooltip.bodyColor = c.foreground;
        chart.options.plugins.tooltip.borderColor = c.border;
        chart.options.plugins.tooltip.cornerRadius = 0;
      }
      chart.update("none");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [theme]);

  const initial = typeof window !== "undefined" ? getColors() : FALLBACKS.light;
  const maxValue = Math.max(...dataPoints, 100);

  const data = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: dataPoints,
        borderColor: initial.primary,
        backgroundColor: initial.primary + "20",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: initial.primary,
        pointBorderColor: initial.background,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: initial.primary,
        pointHoverBorderColor: initial.background,
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const isDark =
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false;

  const options: Parameters<typeof Line>[0]["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: initial.popover,
        titleColor: initial.foreground,
        bodyColor: initial.foreground,
        borderColor: initial.border,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 0,
        displayColors: false,
        callbacks: {
          label: (ctx) =>
            `Revenue: $${(ctx.parsed.y as number).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: initial.muted, font: { size: 12 } },
        border: { color: initial.border },
      },
      y: {
        min: 0,
        max: Math.ceil((maxValue * 1.2) / 100) * 100, // 20% headroom, rounded to nearest 100
        grid: { color: initial.border + "40" },
        ticks: {
          color: initial.muted,
          font: { size: 12 },
          callback: (v) => "$" + Number(v).toLocaleString(),
          maxTicksLimit: 5,
        },
        border: { display: false },
      },
    },
    interaction: { intersect: false, mode: "index" as const },
  };

  return (
    <div className="h-64">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
