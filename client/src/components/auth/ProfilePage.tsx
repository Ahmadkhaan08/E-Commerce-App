"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PriceFormatter from "@/components/common/PriceFormatter";
import { cn } from "@/lib/utils";
import { useOrderStore, useUserStore } from "@/lib/store";
import authApi from "@/lib/authApi";
import { addAddress, deleteAddress, updateAddress } from "@/lib/addressApi";
import { toast } from "sonner";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  CreditCard,
  Home,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";

type Address = {
  _id: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
};

type ProfileFormState = {
  name: string;
  email: string;
  avatar: string;
};

type ProfileFormErrors = {
  name?: string;
  avatar?: string;
};

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-627.jpg?w=360";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const SHIPPING_COST=250
const TAX_RATE=0.08 ;
const ProfilePage = () => {
  const router = useRouter();
  const { authUser, logoutUser, auth_token, updateUser } = useUserStore();
  const { orders, isLoading: ordersLoading, loadOrders } = useOrderStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: authUser?.name || "",
    email: authUser?.email || "",
    avatar: authUser?.avatar || "",
  });
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(authUser?.addresses || []);
  const [addressLoading, setAddressLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    setAddresses(authUser?.addresses || []);
  }, [authUser]);

  useEffect(() => {
    setProfileForm({
      name: authUser?.name || "",
      email: authUser?.email || "",
      avatar: authUser?.avatar || "",
    });
  }, [authUser]);

  useEffect(() => {
    if (auth_token && orders.length === 0 && !ordersLoading) {
      loadOrders(auth_token);
    }
  }, [auth_token, orders.length, ordersLoading, loadOrders]);

  // const filteredOrders = useMemo(() => {
  //   const normalized = orders.reverse()?.map((o) => ({
  //     ...o,
  //     uiStatus: o.status === "paid" ? "completed" : o.status,
  //   }));
  //   if (selectedStatus === "all") return normalized;
  //   return normalized.filter((o) => o.uiStatus === selectedStatus);
    

  // }, [orders, selectedStatus]);


  const profileCompletion = useMemo(() => {
    const fields = [authUser?.name, authUser?.email];
    const filled = fields.filter(Boolean).length;
    return Math.min(100, Math.round((filled / fields.length) * 100)) || 60;
  }, [authUser]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((order) => order._id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const validateProfileForm = (): boolean => {
    const nextErrors: ProfileFormErrors = {};
    const trimmedName = profileForm.name.trim();

    if (!trimmedName) {
      nextErrors.name = "Full name is required.";
    } else if (trimmedName.length < 2) {
      nextErrors.name = "Full name must be at least 2 characters.";
    }

    setProfileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleProfileFieldChange = (key: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
    setProfileErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleProfileImageChange = (file?: File) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setProfileErrors((prev) => ({
        ...prev,
        avatar: "Only JPG, PNG, or WEBP images are allowed.",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setProfileErrors((prev) => ({
        ...prev,
        avatar: "Image must be smaller than 2MB.",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleProfileFieldChange("avatar", String(reader.result || ""));
      setProfileErrors((prev) => ({ ...prev, avatar: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      name: authUser?.name || "",
      email: authUser?.email || "",
      avatar: authUser?.avatar || "",
    });
    setProfileErrors({});
    setIsProfileDialogOpen(false);
  };

  const handleSaveProfile = async () => {
    if (!authUser || !auth_token) {
      toast.error("Please sign in to update your profile.");
      return;
    }

    if (!validateProfileForm()) return;

    setProfileLoading(true);
    try {
      const response = await authApi.put<{ _id: string; name: string; email?: string; avatar?: string; role: string; addresses?: Address[] }>(
        `/users/${authUser._id}`,
        {
          name: profileForm.name.trim(),
          avatar: profileForm.avatar,
          addresses: authUser.addresses || [],
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Unable to update profile.");
      }

      const updated = response.data;
      updateUser({
        ...authUser,
        name: updated.name || authUser.name,
        email: updated.email || authUser.email,
        avatar: updated.avatar || authUser.avatar,
        addresses: updated.addresses || authUser.addresses,
        role: updated.role || authUser.role,
      });

      toast.success("Profile updated successfully.");
      setIsProfileDialogOpen(false);
    } catch (error) {
      console.error("Profile update failed", error);
      toast.error(error instanceof Error ? error.message : "Unable to update profile right now.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await authApi.post("/auth/logout", {});
      if (response?.success) {
        await logoutUser();
        toast.success("Logged out successfully");
        router.push("/");
      }
    } catch (error) {
      console.error("Logout Failed:", error);
      toast.error("Logout failed, try again later.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  

  const handleSubmitAddress = async (payload: AddressFormState) => {
    if (!authUser || !auth_token) {
      toast.error("Please sign in to manage addresses.");
      return;
    }

    setAddressLoading(true);
    try {
      const response = editingAddress
        ? await updateAddress(authUser._id, editingAddress._id, payload, auth_token)
        : await addAddress(authUser._id, payload, auth_token);

      if (response.success) {
        setAddresses(response.addresses);
        updateUser({ ...authUser, addresses: response.addresses });
        toast.success(editingAddress ? "Address updated" : "Address added");
        setIsAddressDialogOpen(false);
        setEditingAddress(null);
      }
    } catch (error) {
      console.error("Address save failed", error);
      toast.error("Unable to save address right now.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!authUser || !auth_token) {
      toast.error("Please sign in to manage addresses.");
      return;
    }
    setAddressLoading(true);
    try {
      const response = await deleteAddress(authUser._id, id, auth_token);
      if (response.success) {
        setAddresses(response.addresses);
        updateUser({ ...authUser, addresses: response.addresses });
        toast.success("Address removed");
      }
    } catch (error) {
      console.error("Address delete failed", error);
      toast.error("Unable to delete address right now.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleOpenOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderDialogOpen(true);
  };

  const getPaymentStatus = (status: string, paidAt?: string) => {
    if (status === "paid" || status === "completed" || Boolean(paidAt)) {
      return "Paid";
    }
    return "Unpaid";
  };

console.log(authUser);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Badge className="w-fit bg-blue-50 text-blue-700 border-blue-200">Profile</Badge>
          <h1 className="text-3xl font-semibold text-slate-900">Your Profile</h1>
          <p className="text-slate-600">
            Manage your personal info, saved addresses, and recent orders in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-slate-200">
                  <AvatarImage src={authUser?.avatar || undefined} alt={authUser?.name || "User"} />
                  <AvatarFallback className="bg-blue-50 text-blue-700">
                    {(authUser?.name || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl text-slate-900">{authUser?.name || "Guest User"}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1 capitalize hover:bg-babyshopSky/20 hoverEffect   mt-2 border border-babyshopSky text-black p-2 rounded-full cursor-pointer">
                      <User className="h-4 w-4" /> {authUser?.role }
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 hover:bg-babyshopSky/20 border border-babyshopSky">
                      <Pencil className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your personal info and profile photo.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 transition-all duration-200">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Avatar className="h-20 w-20 border border-slate-200">
                          <AvatarImage
                            src={profileForm.avatar || authUser?.avatar || DEFAULT_AVATAR}
                            alt={profileForm.name || "User"}
                          />
                          <AvatarFallback className="bg-blue-50 text-blue-700">
                            {(profileForm.name || "U").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-2">
                          <Label htmlFor="profile-avatar" className="text-sm font-medium text-slate-700">
                            Profile Photo
                          </Label>
                          <div>
                            <input
                              id="profile-avatar"
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              className="hidden"
                              onChange={(e) => handleProfileImageChange(e.target.files?.[0])}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-2"
                              onClick={() => document.getElementById("profile-avatar")?.click()}
                            >
                              <Camera className="h-4 w-4" />
                              Upload Photo
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500">JPG, PNG, WEBP up to 2MB.</p>
                          {profileErrors.avatar && (
                            <p className="text-xs text-rose-600">{profileErrors.avatar}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profile-name">Full Name</Label>
                        <Input
                          id="profile-name"
                          value={profileForm.name}
                          onChange={(e) => handleProfileFieldChange("name", e.target.value)}
                          placeholder="Enter your full name"
                          aria-invalid={Boolean(profileErrors.name)}
                        />
                        {profileErrors.name && <p className="text-xs text-rose-600">{profileErrors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profile-email">Email</Label>
                        <Input
                          id="profile-email"
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="bg-slate-50"
                          aria-readonly="true"
                        />
                        <p className="text-xs text-slate-500">Email updates are currently disabled.</p>
                      </div>
                    </div>

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" onClick={handleCancelProfileEdit}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleSaveProfile} disabled={profileLoading} className="gap-2">
                        {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {profileLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" className="gap-2 bg-red-500 hover:bg-red-700" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" /> Profile completion
                  </div>
                  <span className="font-semibold text-slate-900">{profileCompletion}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryTile label="Orders" value={orders.length} icon={<ShoppingBag className="h-5 w-5" />} />
                <SummaryTile label="Addresses" value={String(addresses.length)} icon={<Home className="h-5 w-5" />} />
                <SummaryTile label="Loyalty" value="Gold" icon={<BadgeCheck className="h-5 w-5" />} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-900">Saved Addresses</CardTitle>
              <Dialog
                open={isAddressDialogOpen}
                onOpenChange={(open) => {
                  setIsAddressDialogOpen(open);
                  if (!open) setEditingAddress(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add New</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingAddress ? "Edit address" : "Add address"}</DialogTitle>
                    <DialogDescription>Save an address for faster checkout.</DialogDescription>
                  </DialogHeader>
                  <AddressForm
                    loading={addressLoading}
                    defaultValues={editingAddress || undefined}
                    onSubmit={(payload) => handleSubmitAddress(payload)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses.length === 0 && (
                <EmptyState message="No addresses yet. Add one to speed up checkout." />
              )}
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {address.isDefault ? "Default" : "Address"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-babyshopSky hover:bg-babyshopSky/20 rounded-full"
                        aria-label="Edit address"
                        onClick={() => {
                          setEditingAddress(address);
                          setIsAddressDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 text-slate-600 " />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-rose-500 hover:bg-rose-100 rounded-full"
                        aria-label="Delete address"
                        onClick={() => handleDeleteAddress(address._id)}
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{authUser?.name}</p>
                  <p className="text-sm text-slate-600">
                    {address.street}, {address.city}, {address.country} {address.postalCode}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg text-slate-900">Recent Orders</CardTitle>
              <p className="text-sm text-slate-600">Track your latest purchases and their status.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as "all" | "pending" | "completed" | "cancelled")}> 
              <TabsContent value={selectedStatus} className="mt-4 space-y-3">
                {orders.length === 0 && <EmptyState message="No orders found for this filter." />}
                {[...orders].reverse().slice(0,5).map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="font-semibold text-slate-900">{order._id}</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(order.createdAt))}
                      </p>
                      <p className="text-sm text-slate-700">Items: {order.items.length}</p>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                        <PriceFormatter amount={(order.total * TAX_RATE) + SHIPPING_COST + order.total} className="text-lg font-semibold text-slate-900" />
                      <div className="flex items-center justify-end gap-2">
                        <StatusBadge status={order.status as "pending" | "paid" | "completed" | "cancelled" } />
                        {order.status === "completed" && (
                          <Button variant="ghost" size="sm" className="h-8" onClick={() => toast.info("Reorder coming soon")}>Reorder</Button>
                        )}
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleOpenOrderDetails(order._id)}>
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-between text-sm text-slate-600">
            <span>Showing {5} of {orders.length} orders</span>
            <Button variant="ghost" size="sm" className="hover:bg-babyshopSky/20" onClick={() => router.push("/user/orders")}>View all orders</Button>
          </CardFooter>
        </Card>

        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Review your order summary, payment, and shipping info.</DialogDescription>
            </DialogHeader>

            {!selectedOrder ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Unable to load this order.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Order ID</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{selectedOrder._id}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Order Date</p>
                    <p className="mt-1 text-sm text-slate-900">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(selectedOrder.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                    <StatusBadge status={selectedOrder.status as "pending" | "paid" | "completed" | "cancelled"} />
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    <p className={cn("text-sm font-medium", getPaymentStatus(selectedOrder.status, selectedOrder.paidAt) === "Paid" ? "text-emerald-700" : "text-amber-700")}>
                      Payment: {getPaymentStatus(selectedOrder.status, selectedOrder.paidAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-xs"
                      >
                        <img
                          src={item.image || "/images/products/default.jpg"}
                          alt={item.name}
                          className="h-14 w-14 rounded-md border border-slate-100 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                        </div>
                        <PriceFormatter amount={item.price * item.quantity} className="text-sm font-semibold text-slate-900" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total Amount</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      <PriceFormatter amount={(selectedOrder.total * TAX_RATE) + SHIPPING_COST + selectedOrder.total} className="text-xl font-semibold text-slate-900" />
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      Shipping Address
                    </div>
                    {selectedOrder.shippingAddress ? (
                      <p className="mt-1 text-sm text-slate-700">
                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {" "}
                        {selectedOrder.shippingAddress.country} {selectedOrder.shippingAddress.postalCode}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">Not available</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOrderDialogOpen(false)} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: "pending" | "paid" | "completed" | "cancelled" }) => {
  const styles: Record<"pending" | "paid" | "completed" | "cancelled", string> = {
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    paid: "bg-blue-50 text-blue-800 border-blue-200",
    completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-800 border-rose-200",
  };
  return (
    <Badge className={cn("capitalize p-2 rounded-lg", styles[status])}>{status}</Badge>
  );
};

const SummaryTile = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
    <div className="flex items-center gap-2 text-slate-500 text-sm">
      <span className="text-slate-700">{icon}</span>
      {label}
    </div>
    <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
    <span>{message}</span>
    <Badge className="bg-white text-slate-700 border-slate-200">Coming soon</Badge>
  </div>
);

const AddressForm = ({
  onSubmit,
  loading = false,
  defaultValues,
}: {
  onSubmit: (address: AddressFormState) => void;
  loading?: boolean;
  defaultValues?: Address;
}) => {
  const [form, setForm] = useState<AddressFormState>({
    street: defaultValues?.street || "",
    city: defaultValues?.city || "",
    country: defaultValues?.country || "Pakistan",
    postalCode: defaultValues?.postalCode || "",
    isDefault: defaultValues?.isDefault || false,
  });

  const updateField = (key: keyof Omit<Address, "id">, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="street">Street</Label>
        <Input id="street" value={form.street} onChange={(e) => updateField("street", e.target.value)} placeholder="Street, building" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="City" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Country" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="postalCode">Postal code</Label>
        <Input id="postalCode" value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} placeholder="Postal code" />
      </div>
      <DialogFooter className="pt-2">
        <Button onClick={() => onSubmit(form)} disabled={loading}>
          {loading ? "Saving..." : "Save address"}
        </Button>
      </DialogFooter>
    </div>
  );
};

type AddressFormState = {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
};

export default ProfilePage;
