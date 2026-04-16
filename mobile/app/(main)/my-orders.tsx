import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { apiRequest, getAuthToken } from "@/constants/mobileApi";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

type OrderItem = {
  _id: string;
  status: string;
  subtotal?: number;
  shippingFee?: number;
  taxAmount?: number;
  total: number;
  items?: Array<{ quantity?: number; price?: number }>;
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
          [...orders].reverse().map((order) => {
            const orderDateTime = order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-PK", {
                dateStyle: "medium",
                timeStyle: "short",
              })
              : "N/A";

            const subtotal =
              order.subtotal ??
              (Array.isArray(order.items)
                ? order.items.reduce(
                  (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
                  0,
                )
                : 0);
            const shippingFee = order.shippingFee ?? 0;
            const taxAmount = order.taxAmount ?? 0;

            return (
            <Pressable key={order._id} onPress={() => router.push({ pathname: "/(main)/order-tracking/[id]", params: { id: order._id } })} className="mb-3 rounded-2xl border border-[#dce7ff] bg-white p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-[#1f2a44]">Order #{order._id.slice(-6).toUpperCase()}</Text>
                <Text className="rounded-full bg-[#edf2ff] px-2 py-1 text-xs font-semibold text-[#5368ce]">{order.status}</Text>
              </View>
              <Text className="mt-2 text-xs text-[#63739a]">{orderDateTime}</Text>

              <View className="mt-3 rounded-xl bg-[#f7faff] p-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-[#63739a]">Subtotal</Text>
                  <Text className="text-xs font-semibold text-[#1f2a44]">{toPrice(subtotal)}</Text>
                </View>
                <View className="mt-1 flex-row items-center justify-between">
                  <Text className="text-xs text-[#63739a]">Shipping</Text>
                  <Text className="text-xs font-semibold text-[#1f2a44]">{shippingFee === 0 ? "Free" : toPrice(shippingFee)}</Text>
                </View>
                <View className="mt-1 flex-row items-center justify-between">
                  <Text className="text-xs text-[#63739a]">Tax (8%)</Text>
                  <Text className="text-xs font-semibold text-[#1f2a44]">{toPrice(taxAmount)}</Text>
                </View>
                {shippingFee === 0 ? (
                  <View className="mt-2 self-start rounded-full bg-emerald-100 px-2 py-1">
                    <Text className="text-[10px] font-semibold text-emerald-700">Free shipping unlocked</Text>
                  </View>
                ) : null}
              </View>

              <Text className="mt-2 text-sm font-bold text-[#1f2a44]">Total: {toPrice(order.total)}</Text>
            </Pressable>
            );
          })
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
