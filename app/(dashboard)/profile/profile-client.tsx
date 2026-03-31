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
import { toast } from "sonner";

export function ProfileContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

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

  // Danger Zone State
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      toast.error("Failed to update profile", { description: error.message });
      return;
    }

    toast.success("Success", { description: "Profile updated successfully" });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Error", { description: "New passwords don't match" });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Error", {
        description: "Password must be at least 8 characters",
      });
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
        toast.error("Error changing password", {
          description:
            error.message || "You may have signed up using a social account.",
        });
      } else {
        toast.error("Error", { description: error.message });
      }
      return;
    }

    toast.success("Success", { description: "Password updated successfully" });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const { error } = await authClient.deleteUser({});

    if (error) {
      toast.error("Failed to delete account", { description: error.message });
      setIsDeleting(false);
      return;
    }

    toast.success("Account deleted");
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

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image to Cloudinary.");
      }

      const { url } = await res.json();

      const { error } = await authClient.updateUser({ image: url });

      if (error) {
        toast.error("Profile update failed", { description: error.message });
      } else {
        toast.success("Avatar updated successfully");
      }
    } catch (err) {
      toast.error("Upload error", {
        description:
          err instanceof Error ? err.message : "Error processing image",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true);
    const { error } = await authClient.updateUser({ image: "" });
    setIsRemovingAvatar(false);

    if (error) {
      toast.error("Failed to remove avatar", { description: error.message });
    } else {
      toast.success("Avatar removed");
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
        <h2 className="text-3xl font-bold font-heading">Profile Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account information, security, and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-12 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/50">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage
                      src={user?.image || ""}
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
                        {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
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
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, GIF or PNG. Max size of 800K
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
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
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Emails cannot be changed directly at this time.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <Button type="submit" disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Personal Details
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
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
                  <CardTitle>Danger Zone</CardTitle>
                </div>
                <CardDescription>
                  Permanently delete your account and all associated data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your active projects and
                        data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Yes, delete account"
                        )}
                      </Button>
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
