"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  User,
  CreditCard,
  Palette,
  Zap,
  Check,
  Loader2,
  ExternalLink,
  Shield,
  MailCheck,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FREE_LIMITS } from "@/lib/subscription/limits";
import { UpgradeModal } from "@/components/upgrade-modal";
import { locales, freeLocales, LOCALE_DISPLAY_NAMES } from "@/lib/i18n/config";
import type { Locale, FreeLocale } from "@/lib/i18n/config";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/translation-context";
import {
  toastMutationError,
  fetchJson,
} from "@/lib/network-error";
import { cn } from "@/lib/utils";
import { useNetworkStatusContext } from "@/contexts/network-status-context";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UsageData {
  isPro: boolean;
  limits: { clients: number; projects: number; invoicesPerMonth: number };
  usage: { clients: number; projects: number; invoicesThisMonth: number };
}

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "account", labelKey: "settings.account", icon: User },
  { id: "billing", labelKey: "settings.billing", icon: CreditCard },
  {
    id: "branding",
    labelKey: "settings.branding",
    icon: Palette,
    proOnly: true,
  },
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
  const t = useTranslation();
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
              <Zap className="h-3 w-3" /> {t("settings.unlimited")}
            </span>
          ) : (
            `${current} / ${limit}${suffix}`
          )}
        </span>
      </div>
      {limit !== Infinity && (
        <div className="h-2 bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
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
  
  // Use the network status context for reactive offline detection
  const { isOnline } = useNetworkStatusContext();
  const isOffline = !isOnline;

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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Persistent Cooldown
  useEffect(() => {
    const checkCooldown = () => {
      const lastSent = localStorage.getItem("otp-last-sent");
      if (lastSent) {
        const remaining =
          60 - Math.floor((Date.now() - parseInt(lastSent)) / 1000);
        if (remaining > 0) {
          setCooldown(remaining);
        } else {
          setCooldown(0);
        }
      }
    };
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Branding local state
  const [brandColor, setBrandColor] = useState("#f59e0b");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");

  // Preferences local state
  const [autoCreateInvoice, setAutoCreateInvoice] = useState(false);
  const [themePref, setThemePref] = useState("system");
  const [currencyPref, setCurrencyPref] = useState("USD");
  const [timezonePref, setTimezonePref] = useState("UTC");
  const [dateFormatPref, setDateFormatPref] = useState("MM/DD/YYYY");
  const [paymentDetailsPref, setPaymentDetailsPref] = useState("");
  const [languagePref, setLanguagePref] = useState<Locale>(() => {
    // Initialize from URL locale — this is the actual active locale
    if (typeof window !== "undefined") {
      const seg = window.location.pathname.split("/")[1];
      if (seg && ["en", "es", "fr", "de", "zh-CN", "ar"].includes(seg)) {
        return seg as Locale;
      }
    }
    return "en";
  });
  const [showLanguageUpgradeModal, setShowLanguageUpgradeModal] =
    useState(false);

  const { setTheme } = useTheme();
  const t = useTranslation();

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
      .catch(() => toast.error(t("toasts.failedToLoadUsage")))
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
        if (d.theme) setThemePref(d.theme);
        if (d.defaultCurrency) setCurrencyPref(d.defaultCurrency);
        if (d.timezone) setTimezonePref(d.timezone);
        if (d.dateFormat) setDateFormatPref(d.dateFormat);
        if (d.paymentDetails) setPaymentDetailsPref(d.paymentDetails);
        // Note: language is initialized from the URL locale, not the DB value,
        // so we don't override it here.
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
      .catch(() => toast.error(t("toasts.failedToLoadUsage")))
      .finally(() => setIsLoadingUsage(false));
  }, []);

  const handleManageBilling = async () => {
    if (isOffline) {
      toast.warning("You're offline", {
        description: "Cannot open billing portal while offline.",
      });
      return;
    }
    setIsLoadingPortal(true);
    try {
      const { data, error } = await fetchJson(
        "/api/stripe/create-portal-session",
        {
          method: "POST",
        },
      );
      if (error) throw new Error(error);
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error(t("toasts.failedToBillingPortal"));
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (cooldown > 0) return;
    localStorage.setItem("otp-last-sent", Date.now().toString());
    setCooldown(60);
    setIsSendingOtp(true);
    try {
      const { error } = await (authClient as any).emailOtp.sendVerificationOtp({
        email: user?.email,
        type: "email-verification",
      });
      if (error) {
        toast.error(t("toasts.verificationSentFail"));
      } else {
        setShowOTP(true);
        toast.success(t("toasts.verificationSent"));
      }
    } catch {
      toast.error(t("toasts.verificationSentFail"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setIsSendingOtp(true);
    try {
      const { error } = await (authClient as any).emailOtp.verifyEmail({
        email: user?.email,
        otp,
      });
      if (error) {
        toast.error(t("toasts.invalidVerificationCode"));
        setOtp("");
      } else {
        toast.success(t("toasts.emailVerified"));
        setShowOTP(false);
        // Silently refresh the session or trigger a full reload
        window.location.reload();
      }
    } catch {
      toast.error(t("toasts.invalidVerificationCode"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleUpdatePref = async (key: string, value: any) => {
    setIsSavingPref(true);

    if (key === "autoCreateInvoice") setAutoCreateInvoice(value);
    if (key === "theme") {
      setThemePref(value);
      setTheme(value); // Apply to next-themes immediately
    }
    if (key === "defaultCurrency") setCurrencyPref(value);
    if (key === "timezone") setTimezonePref(value);
    if (key === "dateFormat") setDateFormatPref(value);
    if (key === "paymentDetails") setPaymentDetailsPref(value);

    try {
      const { error } = await fetchJson("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (error) throw new Error(error);
      toast.success(t("toasts.preferencesUpdated"));
    } catch (err) {
      toastMutationError(err, t("toasts.failedToUpdate"));
    } finally {
      setIsSavingPref(false);
    }
  };

  const handleLanguageChange = async (locale: Locale) => {
    const isProLocale = !(freeLocales as readonly string[]).includes(locale);
    if (isProLocale && !isPro) {
      setShowLanguageUpgradeModal(true);
      return;
    }

    setLanguagePref(locale);
    setIsSavingPref(true);
    try {
      const { data, error, response } = await fetchJson(
        "/api/settings/profile",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: locale }),
        },
      );
      if (response.status === 403 && data?.code === "UPGRADE_REQUIRED") {
        setShowLanguageUpgradeModal(true);
        setLanguagePref(languagePref); // revert
        return;
      }
      if (error) throw new Error(error);

      // Update cookie and navigate to new locale path via router (no reload)
      document.cookie = `NEXT_LOCALE=${locale}; Max-Age=31536000; Path=/; SameSite=Lax`;
      const segments = window.location.pathname.split("/");
      segments[1] = locale;
      router.push(segments.join("/") + window.location.search);
    } catch (err) {
      toastMutationError(err, t("toasts.failedToUpdateLanguage"));
      setLanguagePref(languagePref); // revert on error
    } finally {
      setIsSavingPref(false);
    }
  };

  const handleSaveBranding = async () => {
    setIsSavingBrand(true);
    try {
      const { error } = await fetchJson("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColor, invoicePrefix, brandLogoUrl }),
      });
      if (error) throw new Error(error);
      toast.success(t("toasts.brandingUpdated"));
    } catch (err) {
      toastMutationError(err, t("toasts.failedToSaveBranding"));
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isOffline) {
      toast.warning("You're offline", {
        description: "Logo upload is unavailable while offline.",
      });
      return;
    }

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data, error, response } = await fetchJson(
        "/api/upload?intent=brandLogo",
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.status === 413) {
        throw new Error("Image is too large. Please use a file under 5MB.");
      }

      if (error) throw new Error(error);

      setBrandLogoUrl(data.url);
      toast.success(t("toasts.logoUploaded"));
    } catch (err: any) {
      toastMutationError(err, "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <UpgradeModal
        isOpen={showLanguageUpgradeModal}
        onClose={() => setShowLanguageUpgradeModal(false)}
        resource="language"
      />
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold font-heading">
          {t("settings.title")}
        </h2>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
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
            {t(tab.labelKey as any)}
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
                <CardTitle className="text-base">
                  {t("settings.profileInformation")}
                </CardTitle>
                <CardDescription>
                  {t("settings.profileSubtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                        {t("settings.name")}
                      </p>
                      <p className="text-sm font-medium">{user?.name || "—"}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/profile")}
                    >
                      {t("settings.edit")}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                        {t("settings.email")}
                      </p>
                      <p className="text-sm font-medium">
                        {user?.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                        {t("settings.plan")}
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
                            {t("settings.paymentPastDue")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!isPro && (
                      <Button
                        size="sm"
                        onClick={() => router.push("/checkout")}
                      >
                        <Zap className="mr-2 h-3.5 w-3.5" />{" "}
                        {t("settings.upgrade")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("settings.preferences")}
                </CardTitle>
                <CardDescription>
                  {t("settings.preferencesSubtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {t("settings.autoDraftInvoices")}
                    </Label>
                    <p className="text-xs text-muted-foreground mr-6">
                      {t("settings.autoDraftSubtitle")}
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

                <div className="flex items-center justify-between py-2 border-t border-border">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("settings.theme")}
                    </Label>
                    <p className="text-xs text-muted-foreground mr-6">
                      {t("settings.themeSubtitle")}
                    </p>
                  </div>
                  <Select
                    value={themePref}
                    onValueChange={(val) => handleUpdatePref("theme", val)}
                    disabled={isSavingPref}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-border">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("settings.currency")}
                    </Label>
                    <p className="text-xs text-muted-foreground mr-6">
                      {t("settings.currencySubtitle")}
                    </p>
                  </div>
                  <Select
                    value={currencyPref}
                    onValueChange={(val) =>
                      handleUpdatePref("defaultCurrency", val)
                    }
                    disabled={isSavingPref}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="ETB">ETB (Br)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="AUD">AUD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-border">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("settings.timezone")}
                    </Label>
                    <p className="text-xs text-muted-foreground mr-6">
                      {t("settings.timezoneSubtitle")}
                    </p>
                  </div>
                  <Select
                    value={timezonePref}
                    onValueChange={(val) => handleUpdatePref("timezone", val)}
                    disabled={isSavingPref}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Default)</SelectItem>
                      <SelectItem value="America/New_York">
                        Eastern Time (US)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (US)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (US)
                      </SelectItem>
                      <SelectItem value="Europe/London">London (UK)</SelectItem>
                      <SelectItem value="Europe/Berlin">
                        Central Europe
                      </SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-border">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("settings.dateFormat")}
                    </Label>
                    <p className="text-xs text-muted-foreground mr-6">
                      {t("settings.dateFormatSubtitle")}
                    </p>
                  </div>
                  <Select
                    value={dateFormatPref}
                    onValueChange={(val) => handleUpdatePref("dateFormat", val)}
                    disabled={isSavingPref}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Date Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-border">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("settings.language.title")}
                    </Label>
                    <p className="text-xs text-muted-foreground mr-6">
                      {t("settings.language.description")}
                    </p>
                  </div>
                  <Select
                    value={languagePref}
                    onValueChange={(val) => handleLanguageChange(val as Locale)}
                    disabled={isSavingPref}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {locales.map((locale) => {
                        const isProLocale = !(
                          freeLocales as readonly string[]
                        ).includes(locale);
                        const isDisabled = isProLocale && !isPro;
                        return (
                          <SelectItem
                            key={locale}
                            value={locale}
                            disabled={isDisabled}
                            className={cn(isDisabled && "opacity-60")}
                          >
                            <span className="flex items-center gap-2">
                              {LOCALE_DISPLAY_NAMES[locale]}
                              {isDisabled && (
                                <span className="text-xs px-1 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">
                                  Pro
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 py-3 border-t border-border">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("settings.paymentDetails")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.paymentDetailsSubtitle")}
                    </p>
                  </div>
                  <textarea
                    value={paymentDetailsPref}
                    onChange={(e) => setPaymentDetailsPref(e.target.value)}
                    onBlur={(e) =>
                      handleUpdatePref("paymentDetails", e.target.value)
                    }
                    placeholder={t("settings.paymentDetailsPlaceholder")}
                    className="min-h-[120px] max-h-[200px] w-full p-3 text-sm bg-background border border-input rounded-none focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                    disabled={isSavingPref}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  {t("settings.security")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">
                      {t("settings.password")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.passwordSubtitle")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/profile#password-management")}
                  >
                    {t("settings.manage")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {session?.user && !session.user.emailVerified && (
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-500">
                    <MailCheck className="h-4 w-4" />
                    {t("settings.emailVerificationTitle")}
                  </CardTitle>
                  <CardDescription className="text-amber-600/80 dark:text-amber-400/80">
                    {t("settings.emailVerificationDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showOTP ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder={t("emailVerification.codePlaceholder")}
                        maxLength={6}
                        className="w-32 h-9 text-center font-mono text-sm tracking-widest border-amber-500/50 bg-background"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleVerifyOtp()
                        }
                        disabled={isSendingOtp}
                      />
                      <Button
                        size="sm"
                        className="h-9 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={handleVerifyOtp}
                        disabled={isSendingOtp || otp.length < 6}
                      >
                        {isSendingOtp ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        {t("emailVerification.verify")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 text-xs text-muted-foreground gap-1"
                        onClick={handleSendVerificationCode}
                        disabled={isSendingOtp || cooldown > 0}
                      >
                        <RefreshCw className="h-3 w-3" />
                        {t("emailVerification.resend")}{" "}
                        {cooldown > 0 && `(${cooldown}s)`}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="text-white"
                      onClick={handleSendVerificationCode}
                      disabled={isSendingOtp || cooldown > 0}
                    >
                      {isSendingOtp && (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      )}
                      {t("settings.sendVerificationCode")}{" "}
                      {cooldown > 0 && !isSendingOtp && `(${cooldown}s)`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ─── Billing & Usage Tab ─────────────────────────────────── */}
        {activeTab === "billing" && (
          <div className="space-y-4">
            {/* Current Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("settings.currentPlan")}
                </CardTitle>
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
                          <Zap className="h-3 w-3" /> {t("settings.active")}
                        </Badge>
                      )}
                    </div>
                    {isPro && user?.currentPeriodEnd && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("settings.renews")}{" "}
                        {new Date(user.currentPeriodEnd).toLocaleDateString(
                          "en-US",
                          { dateStyle: "medium" },
                        )}
                      </p>
                    )}
                    {!isPro && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("settings.upgradeSubtitle")}
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
                          {t("settings.manageSub")}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => router.push("/checkout")}>
                      <Zap className="mr-2 h-3.5 w-3.5" />{" "}
                      {t("settings.upgradeButton")}
                    </Button>
                  )}
                </div>

                {isPro && (
                  <div className="rounded-none border border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs text-primary font-medium">
                      {t("settings.proUnlimited")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("settings.usageThisMonth")}
                </CardTitle>
                <CardDescription>
                  {isPro ? t("settings.proActive") : t("settings.freeUsage")}
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
                      label={t("nav.clients")}
                      current={usage.usage.clients}
                      limit={isPro ? Infinity : FREE_LIMITS.clients}
                    />
                    <UsageBar
                      label={t("nav.projects")}
                      current={usage.usage.projects}
                      limit={isPro ? Infinity : FREE_LIMITS.projects}
                    />
                    <UsageBar
                      label={t("settings.usageThisMonth")}
                      current={usage.usage.invoicesThisMonth}
                      limit={isPro ? Infinity : FREE_LIMITS.invoicesPerMonth}
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("toasts.failedToLoadUsage")}
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
                    {t("settings.whatYouGet")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {[
                      t("settings.proFeatures.unlimited"),
                      t("settings.proFeatures.branding"),
                      t("settings.proFeatures.portals"),
                      t("settings.proFeatures.reminders"),
                      t("settings.proFeatures.attachments"),
                      t("settings.proFeatures.support"),
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
                    <Zap className="mr-2 h-4 w-4" />{" "}
                    {t("settings.upgradeProButton")}
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
                      {t("settings.proOnlyBranding")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      {t("settings.unlockBranding")}
                    </p>
                  </div>
                  <Button onClick={() => router.push("/checkout")}>
                    <Zap className="mr-2 h-4 w-4" />{" "}
                    {t("settings.upgradeButton")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t("settings.brandingTitle")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.brandingDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t("settings.brandLogo")}
                      </label>
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
                              {isUploadingLogo
                                ? t("settings.uploadingLogo")
                                : t("settings.uploadLogo")}
                            </Button>
                            {brandLogoUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setBrandLogoUrl("")}
                              >
                                {t("settings.removeLogo")}
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t("settings.brandLogoDesc")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t("settings.brandColor")}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.brandColorDesc")}
                      </p>
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
                        {t("settings.invoicePrefix")}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.invoicePrefixDesc")}
                      </p>
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
                      {isSavingBrand
                        ? t("settings.saving")
                        : t("settings.saveBranding")}
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
