import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function PaymentMethodsScreen() {
  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="h-14 flex-row items-center justify-between border-b border-[#dbe6ff] bg-white px-4">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-full bg-[#eef3ff]">
          <Feather name="arrow-left" size={17} color="#2f3b59" />
        </Pressable>
        <Text className="text-lg font-bold text-[#1f2a44]">Payment Methods</Text>
        <View className="h-9 w-9" />
      </View>

      <View className="p-4">
        <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
          <Text className="text-sm font-semibold text-[#1f2a44]">Available options</Text>
          <Text className="mt-2 text-sm text-[#63739a]">Credit / Debit Card, Google Pay, and Cash on Delivery are available during checkout.</Text>
          <Pressable onPress={() => router.push("/(main)/checkout")} className="mt-3 rounded-2xl bg-[#6f84ec] py-3">
            <Text className="text-center text-sm font-bold text-white">Go to Checkout</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
