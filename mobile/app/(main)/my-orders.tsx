import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { apiRequest, getAuthToken } from "@/constants/mobileApi";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

type OrderItem = {
  _id: string;
  status: string;
  total: number;
  createdAt?: string;
};

type OrdersResponse = {
  orders?: OrderItem[];
};

const toPrice = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await apiRequest<OrdersResponse | OrderItem[]>("/api/orders", undefined, token);
        const parsed = Array.isArray(data) ? data : Array.isArray(data.orders) ? data.orders : [];
        setOrders(parsed);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <ScreenWrapper>
      <InnerScreenHeader title="My Orders" />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}>
        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#7d8ff6" />
          </View>
        ) : orders.length === 0 ? (
          <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
            <Text className="text-sm text-[#63739a]">No orders found yet.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <Pressable key={order._id} onPress={() => router.push({ pathname: "/(main)/order-tracking/[id]", params: { id: order._id } })} className="mb-3 rounded-2xl border border-[#dce7ff] bg-white p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-[#1f2a44]">Order #{order._id.slice(-6).toUpperCase()}</Text>
                <Text className="rounded-full bg-[#edf2ff] px-2 py-1 text-xs font-semibold text-[#5368ce]">{order.status}</Text>
              </View>
              <Text className="mt-2 text-sm text-[#63739a]">Total: {toPrice(order.total)}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
