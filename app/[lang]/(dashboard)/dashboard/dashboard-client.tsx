"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, FolderOpen, FileText, Users, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardInsights } from "@/components/dashboard/dashboard-insights";
import { useTranslation } from "@/lib/i18n/translation-context";
import { metricsQueryOptions } from "@/lib/queries/dashboard";
import { DashboardSkeleton } from "./dashboard-skeleton";

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

/** Translate a status string using project or invoice status keys */
function getStatusLabel(status: string, t: (key: string) => string): string {
  const projectKey = `projects.status.${status}`;
  const invoiceKey = `invoices.status_values.${status}`;
  const fromProject = t(projectKey);
  if (fromProject !== projectKey) return fromProject;
  const fromInvoice = t(invoiceKey);
  if (fromInvoice !== invoiceKey) return fromInvoice;
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function DashboardContent() {
  const { data: metrics, isLoading } = useQuery(metricsQueryOptions());
  const t = useTranslation();

  if (isLoading || !metrics) return <DashboardSkeleton />;

  const statCards = [
    {
      label: t("dashboard.totalRevenue"),
      value: metrics.totalRevenue.toLocaleString(),
      sub: t("dashboard.fromPaidInvoices"),
      icon: DollarSign,
      iconColor: "text-green-600 dark:text-green-500",
    },
    {
      label: t("dashboard.activeProjects"),
      value: metrics.activeProjects,
      sub: `${metrics.totalProjects} ${t("dashboard.total")}`,
      icon: FolderOpen,
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: t("dashboard.pendingInvoices"),
      value: metrics.pendingInvoicesCount,
      sub: `${metrics.pendingInvoicesAmount.toLocaleString()} ${t("dashboard.outstanding")}`,
      icon: FileText,
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      label: t("dashboard.totalClients"),
      value: metrics.totalClients,
      sub: t("dashboard.inYourNetwork"),
      icon: Users,
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  const recentActivity = metrics.recentActivity ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading">
          {t("dashboard.title")}
        </h2>
        <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 w-full">
        <DashboardInsights />

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
                {t("dashboard.recentActivity")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.latestProjectsInvoices")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map(
                  (
                    item: {
                      type: string;
                      label: string;
                      sub: string;
                      status: string;
                      date: Date | string;
                    },
                    i: number,
                  ) => (
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
                        variant={statusVariant(item.status) as any}
                        className="capitalize text-xs shrink-0"
                      >
                        {getStatusLabel(item.status, t)}
                      </Badge>
                    </div>
                  ),
                )
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {t("dashboard.noRecentActivity")}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
