"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  CreditCard,
  Palette,
  Zap,
  Check,
  Loader2,
  ExternalLink,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FREE_LIMITS } from "@/lib/subscription/limits";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UsageData {
  isPro: boolean;
  limits: { clients: number; projects: number; invoicesPerMonth: number };
  usage: { clients: number; projects: number; invoicesThisMonth: number };
}

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "billing", label: "Billing & Usage", icon: CreditCard },
  { id: "branding", label: "Branding", icon: Palette, proOnly: true },
];

// ─── Usage Bar ─────────────────────────────────────────────────────────────────
function UsageBar({
  label,
  current,
  limit,
  suffix = "",
}: {
  label: string;
  current: number;
  limit: number;
  suffix?: string;
}) {
  const pct = limit === Infinity ? 0 : Math.min((current / limit) * 100, 100);
  const atLimit = pct >= 100;
  const nearLimit = pct >= 80 && !atLimit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-medium",
            atLimit && "text-destructive",
            nearLimit && "text-orange-500",
          )}
        >
          {limit === Infinity ? (
            <span className="text-primary flex items-center gap-1">
              <Zap className="h-3 w-3" /> Unlimited
            </span>
          ) : (
            `${current} / ${limit}${suffix}`
          )}
        </span>
      </div>
      {limit !== Infinity && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              atLimit
                ? "bg-destructive"
                : nearLimit
                  ? "bg-orange-500"
                  : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function SettingsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "account",
  );
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  // Profile / Settings State
  const [profile, setProfile] = useState<any>(null);
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Branding local state
  const [brandColor, setBrandColor] = useState("#f59e0b");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");

  // Pref local state
  const [autoCreateInvoice, setAutoCreateInvoice] = useState(false);

  // Sync tab state to URL
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeTab);
    const url = `${pathname}?${params.toString()}`;
    if (searchParams.get("tab") !== activeTab) {
      router.push(url, { scroll: false });
    }
  }, [activeTab, searchParams, pathname, router]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // Initial Fetch
  useEffect(() => {
    // Usage
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => toast.error("Failed to load usage data"))
      .finally(() => setIsLoadingUsage(false));

    // Profile Settings
    fetch("/api/settings/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        if (d.brandColor) setBrandColor(d.brandColor);
        if (d.invoicePrefix) setInvoicePrefix(d.invoicePrefix);
        if (d.brandLogoUrl) setBrandLogoUrl(d.brandLogoUrl);
        if (d.autoCreateInvoice !== undefined)
          setAutoCreateInvoice(d.autoCreateInvoice);
      });
  }, []);

  const user = session?.user as
    | {
        name?: string;
        email?: string;
        plan?: string;
        subscriptionStatus?: string;
        currentPeriodEnd?: string;
      }
    | undefined;

  const isPro =
    user?.subscriptionStatus === "active" ||
    user?.subscriptionStatus === "past_due";

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => toast.error("Failed to load usage data"))
      .finally(() => setIsLoadingUsage(false));
  }, []);

  const handleManageBilling = async () => {
    setIsLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleUpdatePref = async (key: string, value: any) => {
    setIsSavingPref(true);
    if (key === "autoCreateInvoice") setAutoCreateInvoice(value);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error();
      toast.success("Preferences updated");
    } catch {
      toast.error("Failed to update preferences");
    } finally {
      setIsSavingPref(false);
    }
  };

  const handleSaveBranding = async () => {
    setIsSavingBrand(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColor, invoicePrefix, brandLogoUrl }),
      });
      if (!res.ok) throw new Error();
      toast.success("Branding updated successfully");
    } catch {
      toast.error("Failed to save branding");
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload?intent=brandLogo", {
        method: "POST",
        body: formData,
      });

      let errMessage = "Upload failed";
      try {
        const data = await res.json();
        if (!res.ok) errMessage = data.error || errMessage;
        else {
          setBrandLogoUrl(data.url);
          toast.success("Brand logo uploaded");
          return;
        }
      } catch {
        if (res.status === 413)
          errMessage = "Image is too large. Please use a file under 5MB.";
      }
      if (!res.ok) throw new Error(errMessage);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold font-heading">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account, plan, and preferences.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.proOnly && !isPro && (
              <span className="ml-1 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">
                Pro
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* ─── Account Tab ───────────────────────────────────────────── */}
        {activeTab === "account" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Information</CardTitle>
                <CardDescription>
                  Your personal information as shown across the app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                        Name
                      </p>
                      <p className="text-sm font-medium">{user?.name || "—"}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/profile")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                        Email
                      </p>
                      <p className="text-sm font-medium">
                        {user?.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                        Plan
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isPro ? (
                          <Badge className="gap-1 text-xs">
                            <Zap className="h-3 w-3" /> Pro
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Free
                          </Badge>
                        )}
                        {user?.subscriptionStatus === "past_due" && (
                          <Badge variant="destructive" className="text-xs">
                            Payment Past Due
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!isPro && (
                      <Button
                        size="sm"
                        onClick={() => router.push("/checkout")}
                      >
                        <Zap className="mr-2 h-3.5 w-3.5" /> Upgrade
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preferences</CardTitle>
                <CardDescription>
                  General settings and automated behaviors across FreelanceHub.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Auto-create Draft Invoices
                    </Label>
                    <p className="text-xs text-muted-foreground mr-6">
                      When enabled, creating a project will automatically
                      generate a draft invoice matching the project budget.
                    </p>
                  </div>
                  <Switch
                    checked={autoCreateInvoice}
                    onCheckedChange={(val: boolean) =>
                      handleUpdatePref("autoCreateInvoice", val)
                    }
                    disabled={isSavingPref}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-muted-foreground">
                      Change your password or reset it via email.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/profile#password-management")}
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Billing & Usage Tab ─────────────────────────────────── */}
        {activeTab === "billing" && (
          <div className="space-y-4">
            {/* Current Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold font-heading">
                        {isPro ? "Pro" : "Free"}
                      </span>
                      {isPro && (
                        <Badge className="gap-1">
                          <Zap className="h-3 w-3" /> Active
                        </Badge>
                      )}
                    </div>
                    {isPro && user?.currentPeriodEnd && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Renews{" "}
                        {new Date(user.currentPeriodEnd).toLocaleDateString(
                          "en-US",
                          { dateStyle: "medium" },
                        )}
                      </p>
                    )}
                    {!isPro && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Upgrade to Pro for unlimited access and advanced
                        features.
                      </p>
                    )}
                  </div>
                  {isPro ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageBilling}
                      disabled={isLoadingPortal}
                    >
                      {isLoadingPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ExternalLink className="mr-2 h-3.5 w-3.5" />
                          Manage Subscription
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => router.push("/checkout")}>
                      <Zap className="mr-2 h-3.5 w-3.5" /> Upgrade — $5/mo
                    </Button>
                  )}
                </div>

                {isPro && (
                  <div className="rounded-none border border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs text-primary font-medium">
                      ✓ All limits removed — enjoy unlimited access to every
                      feature.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage This Month</CardTitle>
                <CardDescription>
                  {isPro
                    ? "You're on Pro — all limits are removed."
                    : "Your current usage against Free tier limits."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {isLoadingUsage ? (
                  <div className="space-y-5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : usage ? (
                  <>
                    <UsageBar
                      label="Clients"
                      current={usage.usage.clients}
                      limit={isPro ? Infinity : FREE_LIMITS.clients}
                    />
                    <UsageBar
                      label="Projects"
                      current={usage.usage.projects}
                      limit={isPro ? Infinity : FREE_LIMITS.projects}
                    />
                    <UsageBar
                      label="Invoices this month"
                      current={usage.usage.invoicesThisMonth}
                      limit={isPro ? Infinity : FREE_LIMITS.invoicesPerMonth}
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Could not load usage data.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pro Features List — only shown for free users */}
            {!isPro && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    What you get with Pro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {[
                      "Unlimited clients, projects & invoices",
                      "Custom invoice branding (logo + colors)",
                      "Secure client portals",
                      "Automated payment reminders",
                      "Project file attachments",
                      "Priority support",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-5"
                    onClick={() => router.push("/checkout")}
                  >
                    <Zap className="mr-2 h-4 w-4" /> Upgrade to Pro — $5/month
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ─── Branding Tab ────────────────────────────────────────── */}
        {activeTab === "branding" && (
          <div className="space-y-4">
            {!isPro ? (
              /* Locked state for free users */
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center text-center py-12 space-y-4">
                  <div className="h-14 w-14 rounded-none bg-primary/10 flex items-center justify-center">
                    <Palette className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-heading">
                      Custom Branding is a Pro Feature
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      Upload your logo, set your brand colors, and custom
                      invoice prefixes. Your clients will see your brand — not
                      ours.
                    </p>
                  </div>
                  <Button onClick={() => router.push("/checkout")}>
                    <Zap className="mr-2 h-4 w-4" /> Unlock Branding — Upgrade
                    to Pro
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Invoice Branding
                    </CardTitle>
                    <CardDescription>
                      Customize how your invoices appear to clients.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Brand Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                          {brandLogoUrl ? (
                            <img
                              src={brandLogoUrl}
                              alt="Brand Logo"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Palette className="h-6 w-6 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="space-y-2 flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={logoInputRef}
                            onChange={handleLogoUpload}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={isUploadingLogo}
                              onClick={() => logoInputRef.current?.click()}
                            >
                              {isUploadingLogo && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Upload Image
                            </Button>
                            {brandLogoUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setBrandLogoUrl("")}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Max size: 5MB. Use a transparent PNG for best
                            results.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Brand Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="h-9 w-14 cursor-pointer border border-input rounded-none bg-transparent p-0.5"
                        />
                        <input
                          type="text"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Invoice Number Prefix
                      </label>
                      <input
                        type="text"
                        value={invoicePrefix}
                        onChange={(e) => setInvoicePrefix(e.target.value)}
                        placeholder="INV-"
                        maxLength={10}
                        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-none focus:outline-none focus:ring-1 focus:ring-ring uppercase"
                      />
                      <p className="text-xs text-muted-foreground">
                        e.g.,{" "}
                        <code className="bg-muted px-1 py-0.5 text-xs font-mono">
                          {invoicePrefix || "INV-"}
                        </code>{" "}
                        produces{" "}
                        <code className="bg-muted px-1 py-0.5 text-xs font-mono">
                          {invoicePrefix || "INV-"}001
                        </code>
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSaveBranding}
                      disabled={isSavingBrand}
                    >
                      {isSavingBrand && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Branding
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
