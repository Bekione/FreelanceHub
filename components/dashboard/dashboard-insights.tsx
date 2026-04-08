"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, PieChart } from "lucide-react";
import RevenueChart from "@/components/charts/revenue-chart";
import ProjectBreakdownChart from "@/components/charts/project-breakdown-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n/translation-context";
import { useSession } from "@/lib/auth-client";

export function DashboardInsights() {
  const t = useTranslation();
  const { data: session } = useSession();
  const isPro =
    (session?.user as any)?.subscriptionStatus === "active" ||
    (session?.user as any)?.subscriptionStatus === "past_due";

  // Fetches project breakdown from existing API (Pro feature)
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "insights"],
    queryFn: () => fetch("/api/dashboard/insights").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <>
        <Card className="lg:col-span-4 h-full">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 h-full">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Revenue Chart — uses invoicesQueryOptions internally */}
      <Card className="lg:col-span-4 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("dashboard.revenueOverview")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.earningsLast6Months")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>

      {/* Project Breakdown — Pro only */}
      {isPro && data?.projectBreakdown && (
        <>
          <Card className="lg:col-span-3 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                {t("dashboard.projectBreakdown")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.projectBreakdownDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[280px]">
              <ProjectBreakdownChart rawData={data.projectBreakdown} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t("dashboard.topClients")}
              </CardTitle>
              <CardDescription>{t("dashboard.topClientsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topClients?.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {data.topClients.map(
                    (client: { name: string; revenue: number }, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center group bg-neutral-50 dark:bg-neutral-900/50 p-3 border border-neutral-100 dark:border-neutral-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
                            {i + 1}
                          </div>
                          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                            {client.name}
                          </span>
                        </div>
                        <span className="font-semibold text-sm">
                          ${client.revenue.toLocaleString()}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-muted-foreground">
                  {t("dashboard.noRevenueData")}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
