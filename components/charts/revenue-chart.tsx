"use client";

import { useEffect, useRef } from "react";
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

// Reads a CSS custom property and converts HSL (any format) to a hex string.
// Always returns a valid hex color — never an empty string.
function getCSSColor(variable: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  if (!raw) return fallback;

  // Support "H S% L%", "H,S%,L%", and decimal values like "262.1 83.3% 57.8%"
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
    foreground: "#09090b",
    muted: "#71717a",
    border: "#e4e4e7",
  },
  dark: {
    primary: "#a78bfa",
    background: "#09090b",
    foreground: "#fafafa",
    muted: "#a1a1aa",
    border: "#27272a",
  },
};

export default function RevenueChart() {
  const { theme } = useTheme();
  const chartRef = useRef<ChartJS<"line"> | null>(null);

  // Reads current CSS variables — always returns valid hex values
  const getColors = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const fb = isDark ? FALLBACKS.dark : FALLBACKS.light;
    return {
      primary: getCSSColor("--primary", fb.primary),
      background: getCSSColor("--background", fb.background),
      foreground: getCSSColor("--foreground", fb.foreground),
      muted: getCSSColor("--muted-foreground", fb.muted),
      border: getCSSColor("--border", fb.border),
    };
  };

  // On theme change, update the chart imperatively without a re-render cycle
  useEffect(() => {
    const update = () => {
      const chart = chartRef.current;
      if (!chart) return;
      const c = getColors();

      // Update dataset colors
      const dataset = chart.data.datasets[0];
      dataset.borderColor = c.primary;
      dataset.pointBackgroundColor = c.primary;
      dataset.pointBorderColor = c.background;
      dataset.pointHoverBackgroundColor = c.primary;
      dataset.pointHoverBorderColor = c.background;

      // Rebuild gradient
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
        dataset.backgroundColor = gradient as any;
      }

      // Update scales and tooltip colors
      const xScale = chart.options.scales?.x;
      const yScale = chart.options.scales?.y;
      if (xScale?.ticks) xScale.ticks.color = c.muted;
      if (xScale?.border) (xScale.border as any).color = c.border;
      if (yScale?.ticks) yScale.ticks.color = c.muted;
      if (yScale?.grid) yScale.grid.color = c.border + "40";
      if (chart.options.plugins?.tooltip) {
        const isDark = document.documentElement.classList.contains("dark");
        chart.options.plugins.tooltip.backgroundColor = isDark
          ? "#18181b"
          : "#ffffff";
        chart.options.plugins.tooltip.titleColor = c.foreground;
        chart.options.plugins.tooltip.bodyColor = c.foreground;
        chart.options.plugins.tooltip.borderColor = c.border;
      }

      chart.update("none"); // silent update, no animation
    };

    // Run immediately and also watch for class changes on <html>
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [theme]);

  // Seed with safe fallbacks so first render never crashes
  const initial = typeof window !== "undefined" ? getColors() : FALLBACKS.light;

  const data = {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    datasets: [
      {
        label: "Revenue",
        data: [2400, 3200, 2800, 4100, 3600, 5000],
        borderColor: initial.primary,
        backgroundColor: initial.primary + "20", // plain hex with alpha, safe for first paint
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

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#18181b" : "#ffffff",
        titleColor: initial.foreground,
        bodyColor: initial.foreground,
        borderColor: initial.border,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx: any) => `Revenue: $${ctx.parsed.y.toLocaleString()}`,
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
        grid: { color: initial.border + "40", drawBorder: false },
        ticks: {
          color: initial.muted,
          font: { size: 12 },
          callback: (v: any) => "$" + v.toLocaleString(),
          maxTicksLimit: 6,
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
