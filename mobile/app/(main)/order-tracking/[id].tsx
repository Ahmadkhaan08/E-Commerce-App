import OrderTimeline from "@/components/shop/OrderTimeline";
import { apiRequest, getAuthToken } from "@/constants/mobileApi";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OrderItem = {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type OrderResponse = {
  _id: string;
  status: string;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentIntentId?: string;
  items: OrderItem[];
};

const toPrice = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;

export default function OrderTrackingScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) {
      setError("Missing order id");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError(null);
      const data = await apiRequest<OrderResponse>(`/api/orders/${id}`, undefined, token);
      setOrder(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load order tracking");
    }
  }, [id]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadOrder();
      setLoading(false);
    };

    run();
  }, [loadOrder]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrder();
    setRefreshing(false);
  }, [loadOrder]);

  const firstItem = order?.items?.[0];
  const address = order?.shippingAddress
    ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.country} ${order.shippingAddress.postalCode}`
    : "Not available";

  const paymentLabel = order?.paymentIntentId ? "VISA / Card" : "Cash on Delivery";

  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="h-14 flex-row items-center justify-between border-b border-[#dbe6ff] bg-white px-4">
        <Pressable onPress={() => router.back()} className="h-8 w-8 items-center justify-center rounded-full bg-[#eef3ff]">
          <Feather name="arrow-left" size={16} color="#2f3b59" />
        </Pressable>
        <Text className="text-base font-bold text-gray-800">Order Tracking Screen</Text>
        <View className="h-8 w-8" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7d8ff6" />}
      >
        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#7d8ff6" />
          </View>
        ) : null}

        {error ? (
          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-sm text-gray-500">{error}</Text>
          </View>
        ) : null}

        {!loading && !error && order ? (
          <>
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <Text className="text-sm font-bold text-gray-800">Delivery Information</Text>
              <Text className="mt-2 text-xs text-gray-500">Address</Text>
              <Text className="text-sm text-gray-700">{address}</Text>

              <View className="mt-3 flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-gray-500">Payment Method</Text>
                  <Text className="text-sm font-semibold text-gray-700">{paymentLabel}</Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Total Payment</Text>
                  <Text className="text-sm font-extrabold text-[#3347a0]">{toPrice(order.total)}</Text>
                </View>
              </View>
            </View>

            {firstItem ? (
              <View className="mt-3 flex-row rounded-2xl bg-white p-3 shadow-sm">
                <View className="h-16 w-16 overflow-hidden rounded-xl bg-[#edf4ff]">
                  {firstItem.image ? <Image source={{ uri: firstItem.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-gray-800" numberOfLines={2}>
                    {firstItem.name}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">Qty: {firstItem.quantity}</Text>
                  <Text className="mt-1 text-sm font-extrabold text-[#3347a0]">{toPrice(firstItem.price)}</Text>
                </View>
              </View>
            ) : null}

            <View className="mt-3">
              <OrderTimeline status={order.status} />
            </View>
          </>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#dbe6ff] bg-white px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Pressable className="items-center rounded-2xl bg-[#7d8ff6] py-3">
          <Text className="text-sm font-bold text-white">Leave Review</Text>
        </Pressable>
      </View>
    </View>
  );
}
