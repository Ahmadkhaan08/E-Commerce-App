import ScreenWrapper from "@/components/common/ScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

const toPrice = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;

export default function PaymentSuccessScreen() {
  const { orderId, total, paymentMethod, paymentId, address } = useLocalSearchParams<{
    orderId?: string;
    total?: string;
    paymentMethod?: string;
    paymentId?: string;
    address?: string;
  }>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const numericTotal = Number(total || 0);
  const paymentLabel = paymentMethod || "Card";

  return (
    <ScreenWrapper>
      <View className="flex-1 bg-[#edf3ff] px-4 py-8">
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
          className="mt-10 rounded-3xl border border-[#dbe6ff] bg-white p-6"
        >
          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#e8f4ef]">
              <Feather name="check" size={30} color="#2b9a66" />
            </View>
            <Text className="mt-4 text-2xl font-extrabold text-[#1f2a44]">Payment Successful 🎉</Text>
            <Text className="mt-1 text-sm text-[#6e7a97]">Your order has been confirmed.</Text>
          </View>

          <View className="mt-6 gap-3 rounded-2xl bg-[#f7faff] p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-[#6e7a97]">Order ID</Text>
              <Text className="text-sm font-bold text-[#1f2a44]">{orderId || "N/A"}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-[#6e7a97]">Total Amount</Text>
              <Text className="text-sm font-bold text-[#1f2a44]">{toPrice(Number.isFinite(numericTotal) ? numericTotal : 0)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-[#6e7a97]">Payment Method</Text>
              <Text className="text-sm font-bold text-[#1f2a44]">{paymentLabel}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-[#6e7a97]">Payment ID</Text>
              <Text className="text-sm font-bold text-[#1f2a44]">{paymentId || "N/A"}</Text>
            </View>
            <View>
              <Text className="text-sm text-[#6e7a97]">Delivery Address</Text>
              <Text className="mt-1 text-sm font-semibold text-[#1f2a44]">{address || "N/A"}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (orderId) {
                router.replace({ pathname: "/(main)/order-tracking/[id]", params: { id: orderId } });
                return;
              }
              router.replace("/(main)/my-orders");
            }}
            className="mt-6 items-center rounded-2xl bg-[#7d8ff6] py-3"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <Text className="text-sm font-bold text-white">Track Order</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(main)/")}
            className="mt-3 items-center rounded-2xl bg-[#e8eeff] py-3"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <Text className="text-sm font-bold text-[#3f5fd6]">Continue Shopping</Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}
