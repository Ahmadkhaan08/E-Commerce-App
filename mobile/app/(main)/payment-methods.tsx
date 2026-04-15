import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function PaymentMethodsScreen() {
  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Payment Methods" />

      <View className="p-4">
        <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
          <Text className="text-sm font-semibold text-[#1f2a44]">Available options</Text>
          <Text className="mt-2 text-sm text-[#63739a]">Credit / Debit Card, Google Pay, and Cash on Delivery are available during checkout.</Text>
          <Pressable onPress={() => router.push("/(main)/checkout")} className="mt-3 rounded-2xl bg-[#6f84ec] py-3">
            <Text className="text-center text-sm font-bold text-white">Go to Checkout</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}
