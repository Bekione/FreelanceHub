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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

import { useEffect, useState } from "react"
import { useTheme } from "../theme-provider"

export default function RevenueChart() {
  const { theme } = useTheme()
  const [colors, setColors] = useState({
    primary: "#4f46e5",
    primaryLight: "#4f46e511",
    border: "#e5e7eb",
    muted: "#6b7280",
    popover: "#ffffff",
    popoverFg: "#000000",
  })

  // update colors on mount and whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    const get = (v: string) => getComputedStyle(root).getPropertyValue(v).trim() || undefined
    setColors({
      primary: get("--primary") ?? colors.primary,
      primaryLight: `${get("--primary")}1A`, // ~10% opacity
      border: get("--border") ?? colors.border,
      muted: get("--muted-foreground") ?? colors.muted,
      popover: get("--popover") ?? colors.popover,
      popoverFg: get("--popover-foreground") ?? colors.popoverFg,
    })
  }, [theme])

  const data = {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    datasets: [
      {
        label: "Revenue",
        data: [2400, 3200, 2800, 4100, 3600, 5000],
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
        fill: true,
        tension: 0.4,
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
        backgroundColor: colors.popover,
        titleColor: colors.popoverFg,
        bodyColor: colors.popoverFg,
        borderColor: colors.border,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
        },
      },
      y: {
        grid: {
          color: colors.border,
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          callback: (value: any) => "$" + value.toLocaleString(),
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  )
}
