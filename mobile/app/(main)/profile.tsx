import ProfileOption from "@/components/shop/ProfileOption";
import { apiRequest, clearAuthToken, getAuthToken } from "@/constants/mobileApi";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

type ProfileResponse = {
  _id: string;
  name: string;
  email: string;
};

type OrdersResponse = {
  orders?: unknown[];
};

export default function ProfileScreen() {
  const [name, setName] = useState("Guest");
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthReady(true);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      setError(null);

      const [profileResult, ordersResult] = await Promise.allSettled([
        apiRequest<ProfileResponse>("/api/auth/profile", undefined, token),
        apiRequest<OrdersResponse | unknown[]>("/api/orders", undefined, token),
      ]);

      if (profileResult.status === "fulfilled") {
        setName(profileResult.value.name || "User");
      }

      if (ordersResult.status === "fulfilled") {
        const ordersData = ordersResult.value;
        const count = Array.isArray(ordersData)
          ? ordersData.length
          : Array.isArray(ordersData.orders)
            ? ordersData.orders.length
            : 0;
        setOrdersCount(count);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load profile");
    }
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    const run = async () => {
      setLoading(true);
      await loadProfile();
      setLoading(false);
    };

    run();
  }, [authReady, loadProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  const logout = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setMessage("Already logged out");
        return;
      }

      await apiRequest<{ message?: string }>("/api/auth/logout", { method: "POST" }, token);
      await clearAuthToken();
      setName("Guest");
      setOrdersCount(0);
      setMessage("Logged out successfully");
      router.replace("/login");
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : "Failed to logout");
    }
  };

  if (!authReady) {
    return (
      <View className="flex-1 items-center justify-center bg-[#edf3ff]">
        <ActivityIndicator size="large" color="#7f8ff5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#edf3ff]">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7f8ff5" />}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-extrabold text-[#1f2a44]">Hello, {name}!</Text>
            <Text className="mt-1 text-sm text-[#6e7a97]">You have {ordersCount} orders</Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#d7e9ff]">
            <Text className="text-base font-extrabold text-[#294a7b]">{name.slice(0, 1).toUpperCase()}</Text>
          </View>
        </View>

        <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-[#dde6ff] bg-white p-4">
          <Text className="text-sm font-semibold text-[#1f2a44]">Cart shortcut</Text>
          <Pressable onPress={() => router.push("/(main)/cart")} className="h-8 w-8 items-center justify-center rounded-full bg-[#f1f5ff]">
            <Feather name="shopping-cart" size={16} color="#7583a8" />
          </Pressable>
        </View>

        {loading ? (
          <View className="my-12 items-center">
            <ActivityIndicator size="large" color="#7f8ff5" />
          </View>
        ) : null}

        {error ? (
          <View className="mb-4 rounded-2xl border border-[#dce7ff] bg-white p-3">
            <Text className="text-xs text-[#6e7a97]">{error}</Text>
          </View>
        ) : null}

        {message ? (
          <View className="mb-4 rounded-2xl border border-[#dce7ff] bg-white p-3">
            <Text className="text-xs text-[#6e7a97]">{message}</Text>
          </View>
        ) : null}

        <View className="overflow-hidden rounded-2xl border border-[#dde6ff] bg-white">
          <ProfileOption label="Edit Profile" icon="edit-2" onPress={() => router.push("/(main)/edit-profile")} />
          <ProfileOption label="My Orders" icon="package" onPress={() => router.push("/(main)/my-orders")} />
          <ProfileOption label="Addresses" icon="map-pin" onPress={() => router.push("/(main)/addresses")} />
          <ProfileOption label="Payment Methods" icon="credit-card" onPress={() => router.push("/(main)/payment-methods")} />
          <ProfileOption label="Notifications" icon="bell" onPress={() => router.push("/(main)/notifications")} />
          <ProfileOption label="Help & Support" icon="help-circle" onPress={() => router.push("/(main)/help-support")} />
          <ProfileOption label="About Us" icon="info" onPress={() => router.push("/(main)/about")} />
          <ProfileOption label="Log Out" icon="log-out" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
}