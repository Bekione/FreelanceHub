"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
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
} from "chart.js"
import { useTheme } from "@/components/theme-provider"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function RevenueChart() {
  const { theme } = useTheme()
  const [chartColors, setChartColors] = useState({
    primary: "",
    background: "",
    foreground: "",
    muted: "",
    border: "",
  })

  // Function to get CSS custom property value
  const getCSSVariable = (variable: string) => {
    if (typeof window !== "undefined") {
      return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
    }
    return ""
  }

  // Function to convert HSL to hex for Chart.js compatibility
  const hslToHex = (hsl: string) => {
    if (!hsl) return "#000000"

    const hslMatch = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
    if (!hslMatch) return "#000000"

    const h = Number.parseInt(hslMatch[1]) / 360
    const s = Number.parseInt(hslMatch[2]) / 100
    const l = Number.parseInt(hslMatch[3]) / 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // Update colors when theme changes
  useEffect(() => {
    const updateColors = () => {
      const primary = getCSSVariable("--primary")
      const background = getCSSVariable("--background")
      const foreground = getCSSVariable("--foreground")
      const mutedForeground = getCSSVariable("--muted-foreground")
      const border = getCSSVariable("--border")

      setChartColors({
        primary: hslToHex(primary),
        background: hslToHex(background),
        foreground: hslToHex(foreground),
        muted: hslToHex(mutedForeground),
        border: hslToHex(border),
      })
    }

    // Initial color setup
    updateColors()

    // Listen for theme changes
    const observer = new MutationObserver(updateColors)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [theme])

  const data = {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    datasets: [
      {
        label: "Revenue",
        data: [2400, 3200, 2800, 4100, 3600, 5000],
        borderColor: chartColors.primary || "#3b82f6",
        backgroundColor: `${chartColors.primary || "#3b82f6"}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.primary || "#3b82f6",
        pointBorderColor: chartColors.background || "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: chartColors.background || "#ffffff",
        titleColor: chartColors.foreground || "#000000",
        bodyColor: chartColors.foreground || "#000000",
        borderColor: chartColors.border || "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => `Revenue: $${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: chartColors.muted || "#6b7280",
          font: {
            size: 12,
          },
        },
        border: {
          color: chartColors.border || "#e5e7eb",
        },
      },
      y: {
        grid: {
          color: `${chartColors.border || "#e5e7eb"}80`,
          drawBorder: false,
        },
        ticks: {
          color: chartColors.muted || "#6b7280",
          font: {
            size: 12,
          },
          callback: (value: any) => "$" + value.toLocaleString(),
          maxTicksLimit: 6,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    elements: {
      point: {
        hoverBackgroundColor: chartColors.primary || "#3b82f6",
      },
    },
  }

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  )
}
