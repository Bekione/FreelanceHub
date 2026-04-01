"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  FolderOpen,
  FileText,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useDataStore } from "@/store/data-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import RevenueChart from "@/components/charts/revenue-chart";

function statusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "COMPLETED":
      return "secondary";
    default:
      return "outline";
  }
}

export function DashboardContent() {
  const { dashboardMetrics, isLoadingMetrics, fetchMetrics, fetchInvoices } =
    useDataStore();

  useEffect(() => {
    fetchMetrics();
    fetchInvoices(); // Needed so RevenueChart can read PAID invoices from the store
  }, [fetchMetrics, fetchInvoices]);

  // Only show skeleton on the very first visit (no cached data yet)
  const isLoading = isLoadingMetrics && !dashboardMetrics;

  const stats = dashboardMetrics || {
    totalRevenue: 0,
    activeProjects: 0,
    totalProjects: 0,
    pendingInvoicesCount: 0,
    pendingInvoicesAmount: 0,
    totalClients: 0,
  };

  const recentActivity = dashboardMetrics?.recentActivity || [];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your freelance business today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Revenue",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            sub: "From paid invoices",
            icon: DollarSign,
            iconColor: "text-green-600 dark:text-green-500",
          },
          {
            label: "Active Projects",
            value: stats.activeProjects,
            sub: `${stats.totalProjects} total`,
            icon: FolderOpen,
            iconColor: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Pending Invoices",
            value: stats.pendingInvoicesCount,
            sub: `$${stats.pendingInvoicesAmount.toLocaleString()} outstanding`,
            icon: FileText,
            iconColor: "text-orange-600 dark:text-orange-400",
          },
          {
            label: "Total Clients",
            value: stats.totalClients,
            sub: "In your network",
            icon: Users,
            iconColor: "text-purple-600 dark:text-purple-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Revenue Overview
              </CardTitle>
              <CardDescription>
                Your earnings over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest projects and invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.sub}
                      </p>
                    </div>
                    <Badge
                      variant={statusVariant(item.status)}
                      className="capitalize text-xs shrink-0"
                    >
                      {item.status.charAt(0) +
                        item.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No recent activity. Start by adding clients and projects!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
