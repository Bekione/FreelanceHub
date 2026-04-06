"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  Save,
  User,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Zap,
  ExternalLink,
} from "lucide-react";

import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/translation-context";

function SubscriptionCard({ isPro }: { isPro: boolean }) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const t = useTranslation();

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(t("toasts.couldNotOpenBillingPortal"));
        setLoadingPortal(false);
      }
    } catch {
      toast.error(t("toasts.somethingWentWrong"));
      setLoadingPortal(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <CardTitle>{t("profile.subscription")}</CardTitle>
        </div>
        <CardDescription>{t("profile.subscriptionDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                FreelanceHub {isPro ? "Pro" : "Free"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPro
                  ? t("profile.proMonthly")
                  : t("profile.freeUpgrade")}
              </p>
            </div>
          </div>
          {isPro ? (
            <Badge
              variant="default"
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              ⚡ {t("settings.active")}
            </Badge>
          ) : (
            <Badge variant="outline">Free</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-border pt-4">
        {isPro ? (
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={loadingPortal}
          >
            {loadingPortal ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {t("profile.manageSubscription")}
          </Button>
        ) : (
          <Button asChild>
            <Link href="/checkout">
              <Zap className="mr-2 h-4 w-4" />
              {t("profile.upgradePro")}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function ProfileContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslation();
  const user = session?.user;
  const isPro =
    (user as any)?.subscriptionStatus === "active" ||
    (user as any)?.subscriptionStatus === "past_due";

  // Profile Form State
  const [profileData, setProfileData] = useState({ name: "" });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null); // null = loading
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  // Load account providers to detect if user has a password
  useEffect(() => {
    authClient.listAccounts().then(({ data }) => {
      // better-auth returns accounts with a `provider` field (e.g. "credential", "google")
      const hasCreds = data?.some(
        (a: any) => a.provider === "credential" || a.provider === "credentials"
      ) ?? false;
      setHasPassword(hasCreds);
    }).catch(() => setHasPassword(false));
  }, []);

  // Danger Zone State
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deletePassword, setDeletePassword] = useState("");

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  // Initialize form with user data once it's available
  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || "" });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    const { error } = await authClient.updateUser({
      name: profileData.name,
    });

    setIsUpdatingProfile(false);

    if (error) {
      toast.error(t("toasts.failedToUpdateProfile"), { description: error.message });
      return;
    }

    toast.success(t("toasts.profileUpdated"));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("toasts.passwordMismatch"));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error(t("toasts.passwordTooShort"));
      return;
    }

    setIsChangingPassword(true);

    const { error } = await authClient.changePassword({
      newPassword: passwordData.newPassword,
      currentPassword: passwordData.currentPassword,
      revokeOtherSessions: true,
    });

    setIsChangingPassword(false);

    if (error) {
      // Very common error for users who signed up exclusively through Google
      if (error.status === 400 || error.message?.includes("password")) {
        toast.error(t("toasts.failedToChangePassword"), {
          description:
            error.message || "You may have signed up using a social account.",
        });
      } else {
        toast.error(t("toasts.failed"), { description: error.message });
      }
      return;
    }

    toast.success(t("toasts.passwordUpdated"));
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("toasts.passwordMismatch"));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error(t("toasts.passwordTooShort"));
      return;
    }
    setIsSettingPassword(true);
    try {
      // better-auth built-in /set-password endpoint — creates credential account for OAuth users
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: passwordData.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(t("toasts.failedToChangePassword"), { description: data.message || data.error });
        return;
      }
      toast.success(t("toasts.passwordUpdated"));
      setHasPassword(true);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error(t("toasts.somethingWentWrong"));
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    // Safeguard: If password is provided, strictly evaluate it
    if (deletePassword.trim()) {
      const { error: pwdError } = await authClient.signIn.email({
        email: user?.email as string,
        password: deletePassword,
      });
      if (pwdError) {
        toast.error(t("toasts.incorrectPassword"), { description: pwdError.message });
        setIsDeleting(false);
        return;
      }
    }

    // Trigger 'Thanks for using' farewell logic in the background *before* session destruction
    await fetch("/api/auth/farewell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user?.email,
        name: user?.name,
      }),
    }).catch(() => {});

    const { error } = await authClient.deleteUser({});

    if (error) {
      toast.error(t("toasts.failedToDeleteAccount"), { description: error.message });
      setIsDeleting(false);
      return;
    }

    toast.success(t("toasts.accountDeleted"));
    setIsDeleteDialogOpen(false);
    router.push("/login");
  };

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image.",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("intent", "avatar");

      const res = await fetch("/api/upload?intent=avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errMessage = "Failed to upload avatar.";
        if (res.status === 413) {
          errMessage = "Image is too large. Please use a file under 5MB.";
        } else {
          try {
            const errData = await res.json();
            errMessage = errData.error || errMessage;
          } catch {}
        }
        throw new Error(errMessage);
      }

      const { url } = await res.json();

      const { error } = await authClient.updateUser({ image: url });

      if (error) {
        toast.error(t("toasts.failedToUpdateProfile"), { description: error.message });
      } else {
        toast.success(t("toasts.avatarUpdated"));
      }
    } catch (err: any) {
      toast.error(t("toasts.failedToUploadAvatar"), {
        description: err.message || t("toasts.somethingWentWrong"),
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true);
    const { error } = await authClient.updateUser({ image: null });
    setIsRemovingAvatar(false);

    if (error) {
      toast.error(t("toasts.failedToRemoveAvatar"), { description: error.message });
    } else {
      toast.success(t("toasts.avatarRemoved"));
    }
  };

  const initials = profileData.name
    ? profileData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold font-heading">{t("profile.title")}</h2>
        <p className="text-muted-foreground mt-1">
          {t("profile.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-12 space-y-6">
          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <SubscriptionCard
              isPro={(user as { plan?: string })?.plan === "pro"}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>{t("profile.personalInfo")}</CardTitle>
                </div>
                <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/50">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage
                      src={user?.image || undefined}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3 text-center sm:text-left">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAvatarUploadClick}
                        disabled={isUploadingAvatar || isRemovingAvatar}
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="mr-2 h-4 w-4" />
                        )}
                        {isUploadingAvatar ? t("profile.uploading") : t("profile.uploadPhoto")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleRemoveAvatar}
                        disabled={
                          isRemovingAvatar || isUploadingAvatar || !user?.image
                        }
                      >
                        {isRemovingAvatar ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {t("profile.removePhoto")}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("profile.avatarHint")}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("profile.fullName")}</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t("profile.emailAddress")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("profile.emailHint")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <Button type="submit" disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("profile.saving")}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t("profile.saveChanges")}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            id="password-management"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle>{t("profile.changePassword")}</CardTitle>
                </div>
                <CardDescription>
                  {hasPassword === false
                    ? t("profile.noPasswordDesc")
                    : t("profile.passwordDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Google-only user — no password yet */}
                {hasPassword === false && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                      <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{t("profile.noPasswordTitle")}</p>
                        <p className="text-xs text-muted-foreground">{t("profile.noPasswordDesc")}</p>
                        <p className="text-xs text-muted-foreground">{t("profile.setPasswordPrompt")}</p>
                      </div>
                    </div>
                    <form onSubmit={handleSetPassword} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPasswordSet">{t("profile.newPassword")}</Label>
                          <Input
                            id="newPasswordSet"
                            type="password"
                            placeholder="••••••••"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPasswordSet">{t("profile.confirmPassword")}</Label>
                          <Input
                            id="confirmPasswordSet"
                            type="password"
                            placeholder="••••••••"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-border/50">
                        <Button type="submit" disabled={isSettingPassword}>
                          {isSettingPassword ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("profile.settingPassword")}</>
                          ) : (
                            <><Save className="mr-2 h-4 w-4" />{t("profile.setPassword")}</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Email user — has password, show change form */}
                {hasPassword === true && (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">{t("profile.currentPassword")}</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t("profile.confirmPassword")}</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-border/50">
                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("profile.updating")}</>
                        ) : (
                          <><Save className="mr-2 h-4 w-4" />{t("profile.updatePassword")}</>
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Loading state */}
                {hasPassword === null && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle>{t("profile.deleteAccount")}</CardTitle>
                </div>
                <CardDescription>
                  {t("profile.deleteAccountDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground mb-4">
                  {t("profile.deleteWarning")}
                </p>
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={(open) => {
                    if (!open) {
                      setDeleteStep(1);
                      setDeletePassword("");
                    }
                    setIsDeleteDialogOpen(open);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive">{t("profile.deleteAccount")}</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      {deleteStep === 1 ? (
                        <>
                          <DialogTitle>{t("profile.areYouSure")}</DialogTitle>
                          <DialogDescription>
                            {t("profile.deleteDialogDesc")}
                          </DialogDescription>
                          {isPro && (
                            <div className="mt-3 p-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-md border border-amber-500/20 text-sm">
                              <AlertTriangle className="inline h-4 w-4 mr-2 mb-0.5" />
                              {t("profile.proDeleteWarning")}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <DialogTitle>{t("profile.confirmIdentity")}</DialogTitle>
                          <DialogDescription>
                            {t("profile.confirmIdentityDesc")}
                          </DialogDescription>
                          <div className="mt-3 space-y-2">
                            <Label htmlFor="deletePassword">{t("profile.password")}</Label>
                            <Input
                              id="deletePassword"
                              type="password"
                              placeholder="Enter your password"
                              value={deletePassword}
                              onChange={(e) =>
                                setDeletePassword(e.target.value)
                              }
                              autoFocus
                            />
                            <span className="text-xs text-muted-foreground">
                              {t("profile.googleHint")}
                            </span>
                          </div>
                        </>
                      )}
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (deleteStep === 2) {
                            setDeleteStep(1);
                            setDeletePassword("");
                          } else {
                            setIsDeleteDialogOpen(false);
                          }
                        }}
                        disabled={isDeleting}
                      >
                        {deleteStep === 2 ? t("profile.back") : t("common.cancel")}
                      </Button>
                      {deleteStep === 1 ? (
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteStep(2)}
                        >
                          {t("profile.continue")}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("profile.deleting")}
                            </>
                          ) : (
                            t("profile.deleteConfirm")
                          )}
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
