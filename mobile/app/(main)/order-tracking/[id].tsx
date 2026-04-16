import OrderTimeline from "@/components/shop/OrderTimeline";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { apiRequest, getAuthToken } from "@/constants/mobileApi";
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
  discountPercentage?: number;
  image?: string;
};

type OrderResponse = {
  _id: string;
  status: string;
  subtotal?: number;
  shippingFee?: number;
  taxAmount?: number;
  total: number;
  createdAt?: string;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
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

  const address = order?.shippingAddress
    ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.country} ${order.shippingAddress.postalCode}`
    : "Not available";

  const orderDateTime = order?.createdAt
    ? new Date(order.createdAt).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    })
    : "N/A";

  const subtotal = order?.subtotal ?? order?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const originalSubtotal =
    order?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const discountAmount = Math.max(originalSubtotal - subtotal, 0);
  const shippingFee = order?.shippingFee ?? 0;
  const taxAmount = order?.taxAmount ?? 0;

  const paymentLabel = "Cash on Delivery";

  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Order Tracking" />

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

              <View className="mt-2">
                <Text className="text-xs text-gray-500">Order Date & Time</Text>
                <Text className="text-sm font-semibold text-gray-700">{orderDateTime}</Text>
              </View>

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

              <View className="mt-4 rounded-xl bg-[#f7faff] p-3">
                {discountAmount > 0 ? (
                  <View className="mb-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <Text className="text-xs font-semibold text-emerald-700">You Saved {toPrice(discountAmount)} on this order</Text>
                  </View>
                ) : null}
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500">Subtotal</Text>
                  <Text className="text-xs font-semibold text-gray-700">{toPrice(originalSubtotal)}</Text>
                </View>
                {discountAmount > 0 ? (
                  <View className="mt-1 flex-row items-center justify-between">
                    <Text className="text-xs text-gray-500">Discount</Text>
                    <Text className="text-xs font-semibold text-emerald-700">- {toPrice(discountAmount)}</Text>
                  </View>
                ) : null}
                <View className="mt-1 flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500">Shipping</Text>
                  <Text className="text-xs font-semibold text-gray-700">{shippingFee === 0 ? "Free" : toPrice(shippingFee)}</Text>
                </View>
                <View className="mt-1 flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500">Tax (8%)</Text>
                  <Text className="text-xs font-semibold text-gray-700">{toPrice(taxAmount)}</Text>
                </View>
                <View className="mt-2 flex-row items-center justify-between border-t border-[#dce8ff] pt-2">
                  <Text className="text-xs font-bold text-gray-700">Payable Subtotal</Text>
                  <Text className="text-xs font-bold text-[#3347a0]">{toPrice(subtotal)}</Text>
                </View>
              </View>
            </View>

            {order.items.length ? (
              <View className="mt-3 rounded-2xl bg-white p-3 shadow-sm">
                <Text className="text-sm font-bold text-gray-800">Products</Text>
                <View className="mt-2 gap-3">
                  {order.items.map((item, index) => (
                    <View key={`${item._id || item.name}-${index}`} className="flex-row">
                      <View className="h-16 w-16 overflow-hidden rounded-xl bg-[#edf4ff]">
                        {item.image ? <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
                      </View>
                      <View className="ml-3 flex-1">
                        {(() => {
                          const discountPercentage = Math.min(100, Math.max(0, Number(item.discountPercentage) || 0));
                          const originalLineTotal = item.price * item.quantity;
                          const discountedUnitPrice = Math.max(
                            Math.round(item.price - (item.price * discountPercentage) / 100),
                            0,
                          );
                          const discountedLineTotal = discountedUnitPrice * item.quantity;

                          return (
                            <>
                        <Text className="text-sm font-semibold text-gray-800" numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text className="mt-1 text-xs text-gray-500">Qty: {item.quantity}</Text>
                              {discountPercentage > 0 ? (
                                <View className="mt-1 flex-row items-center gap-2">
                                  <Text className="text-xs text-gray-400 line-through">{toPrice(originalLineTotal)}</Text>
                                  <View className="rounded-full bg-emerald-100 px-2 py-0.5">
                                    <Text className="text-[10px] font-semibold text-emerald-700">-{discountPercentage}%</Text>
                                  </View>
                                </View>
                              ) : null}
                              <Text className="mt-1 text-sm font-extrabold text-[#3347a0]">{toPrice(discountedLineTotal)}</Text>
                            </>
                          );
                        })()}
                      </View>
                    </View>
                  ))}
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
    </ScreenWrapper>
  );
}
