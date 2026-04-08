import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ImageUpload from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { passwordSchema, profileSchema } from "@/lib/validation";
import authStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  KeyRound,
  Loader2,
  LogOut,
  Pencil,
  RefreshCw,
  Shield,
  ShieldAlert,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";



type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

type AdminProfile = {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: string;
  updatedAt?: string;
  lastLogin?: string;
};

const Account = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { user, checkIsAdmin, logout } = authStore();
  const isAdmin = checkIsAdmin();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false);
  const [isLogoutAllConfirmOpen, setIsLogoutAllConfirmOpen] = useState(false);
  const [pendingPasswordPayload, setPendingPasswordPayload] =
    useState<PasswordFormValues | null>(null);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      avatar: "",
      phone: "",
      bio: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
      return error.response?.data?.message || fallback;
    }
    return fallback;
  };

  const getProfileMetaStorageKey = (profileId: string) =>
    `admin-profile-meta-${profileId}`;
  const getTwoFactorStorageKey = (profileId: string) =>
    `admin-two-factor-ui-${profileId}`;

  const formatDate = (value?: string) => {
    if (!value) return "Not available";
    return new Date(value).toLocaleString("en-PK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const initials = useMemo(() => {
    const name = profile?.name || user?.name || "Admin";
    const parts = name.trim().split(" ");
    const first = parts[0]?.charAt(0) || "A";
    const second = parts[1]?.charAt(0) || "";
    return `${first}${second}`.toUpperCase();
  }, [profile?.name, user?.name]);

  const loadProfile = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const profileResponse = await axiosPrivate.get("/auth/profile");
      const profileData = profileResponse?.data || {};

      let enriched: {
        email?: string;
        updatedAt?: string;
        createdAt?: string;
      } | null = null;

      if (profileData?._id) {
        try {
          const userResponse = await axiosPrivate.get(`/users/${profileData._id}`);
          enriched = userResponse?.data || null;
        } catch {
          enriched = null;
        }
      }

      const mergedProfile: AdminProfile = {
        _id: profileData._id,
        name: profileData.name || user?.name || "Admin",
        avatar: profileData.avatar || user?.avatar,
        role: profileData.role || user?.role || "admin",
        email: enriched?.email || user?.email || "Not available",
        updatedAt: enriched?.updatedAt,
        lastLogin: profileData?.lastLogin || enriched?.updatedAt,
      };

      const metaRaw = localStorage.getItem(getProfileMetaStorageKey(mergedProfile._id));
      const meta = metaRaw ? JSON.parse(metaRaw) : { phone: "", bio: "" };

      setProfile(mergedProfile);

      profileForm.reset({
        name: mergedProfile.name || "",
        avatar: mergedProfile.avatar || "",
        phone: meta.phone || "",
        bio: meta.bio || "",
      });

      const twoFactorRaw = localStorage.getItem(
        getTwoFactorStorageKey(mergedProfile._id),
      );
      setTwoFactorEnabled(twoFactorRaw === "true");

      if (!showLoader) {
        toast.success("Account data refreshed");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load account profile"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateProfile = async (values: ProfileFormValues) => {
    if (!profile?._id) return;
    setUpdatingProfile(true);

    try {
      const response = await axiosPrivate.put(`/users/${profile._id}`, {
        name: values.name,
        avatar: values.avatar,
      });

      const updated = response?.data || {};
      const nextProfile = {
        ...profile,
        name: updated?.name || values.name,
        avatar: updated?.avatar || values.avatar,
      };

      localStorage.setItem(
        getProfileMetaStorageKey(profile._id),
        JSON.stringify({
          phone: values.phone || "",
          bio: values.bio || "",
        }),
      );

      setProfile(nextProfile);

      authStore.setState((state) => ({
        ...state,
        user: state.user
          ? {
              ...state.user,
              name: nextProfile.name,
              avatar: nextProfile.avatar || "",
            }
          : state.user,
      }));

      setIsEditProfileOpen(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    setPendingPasswordPayload(values);
    setIsPasswordConfirmOpen(true);
  };

  const handleConfirmPasswordChange = async () => {
    if (!profile?._id || !pendingPasswordPayload) return;

    setUpdatingPassword(true);
    try {
      if (!profile.email || profile.email === "Not available") {
        toast.error(
          "Cannot verify current password because email is unavailable for this account.",
        );
        return;
      }

      // Verify current password before allowing update.
      const loginCheck = await axiosPrivate.post("/auth/login", {
        email: profile.email,
        password: pendingPasswordPayload.currentPassword,
      });

      if (!loginCheck?.data?.token) {
        toast.error("Current password verification failed");
        return;
      }

      await axiosPrivate.put(`/users/${profile._id}`, {
        password: pendingPasswordPayload.newPassword,
      });

      setIsPasswordConfirmOpen(false);
      setPendingPasswordPayload(null);
      passwordForm.reset();
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update password"));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await axiosPrivate.post("/auth/logout");
      logout();
      toast.success("Signed out from this session. Global logout is not yet available.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to logout"));
    }
  };

  const handleToggleTwoFactor = () => {
    if (!profile?._id) return;
    const nextValue = !twoFactorEnabled;
    setTwoFactorEnabled(nextValue);
    localStorage.setItem(getTwoFactorStorageKey(profile._id), String(nextValue));
    toast.success(
      nextValue
        ? "2FA UI toggle enabled (backend integration pending)."
        : "2FA UI toggle disabled.",
    );
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadProfile(true);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              You are not authorized to view this account page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const profileValues = profileForm.getValues();

  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your admin profile, password, and security settings.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadProfile(false)}
          disabled={refreshing}
          className="hover:bg-indigo-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-10 w-36" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-10 w-44" />
            </CardContent>
          </Card>
        </div>
      ) : !profile ? (
        <Card>
          <CardHeader>
            <CardTitle>No Account Data</CardTitle>
            <CardDescription>
              We could not find profile data for this admin account.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center overflow-hidden border">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold">{initials}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl capitalize">{profile.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{profile.email || "Not available"}</p>
                  <Badge variant="outline" className="capitalize">
                    {profile.role || "admin"}
                  </Badge>
                </div>
              </div>
              <Button onClick={() => setIsEditProfileOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{profileValues.phone || "Not set"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Login</p>
                <p className="font-medium">{formatDate(profile.lastLogin)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Profile Updated</p>
                <p className="font-medium">{formatDate(profile.updatedAt)}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Bio</p>
                <p className="font-medium break-words">{profileValues.bio || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Update your password. A confirmation step is required before changes are applied.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter current password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="At least 6 characters"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Re-enter new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" disabled={updatingPassword}>
                      {updatingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
              <CardDescription>
                Review login information and manage additional account protections.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">{formatDate(profile.lastLogin)}</p>
                </div>
                <Badge variant="secondary">Secure Session Active</Badge>
              </div>

              <div className="rounded-lg border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    UI toggle only. Backend integration can be connected later.
                  </p>
                </div>
                <Button
                  variant={twoFactorEnabled ? "default" : "outline"}
                  onClick={handleToggleTwoFactor}
                >
                  {twoFactorEnabled ? "Enabled" : "Enable 2FA"}
                </Button>
              </div>

              <div className="rounded-lg border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Logout From All Devices</p>
                  <p className="text-sm text-muted-foreground">
                    Signs out current session. Global device revocation needs backend support.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setIsLogoutAllConfirmOpen(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your profile name, avatar, and optional fields.
            </DialogDescription>
          </DialogHeader>

          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(handleUpdateProfile)}
              className="space-y-5"
            >
              <FormField
                control={profileForm.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Photo</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={updatingProfile}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input value={profile?.email || "Not available"} readOnly disabled />
                  </FormControl>
                </FormItem>

                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+92 300 1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input value={profile?.role || "admin"} readOnly disabled />
                  </FormControl>
                </FormItem>
              </div>

              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Tell something about your admin role"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={updatingProfile}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updatingProfile}>
                  {updatingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isPasswordConfirmOpen} onOpenChange={setIsPasswordConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Password Update</AlertDialogTitle>
            <AlertDialogDescription>
              This will update your admin password. Please confirm to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingPassword}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPasswordChange}
              disabled={updatingPassword}
            >
              {updatingPassword ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isLogoutAllConfirmOpen}
        onOpenChange={setIsLogoutAllConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout From All Devices</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out from this session immediately. Global sign-out is shown here as UI and requires backend support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleLogoutAllDevices}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Account;