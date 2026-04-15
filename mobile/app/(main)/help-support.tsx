import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

export default function HelpSupportScreen() {
  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Help & Support" />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}>
        <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
          <Text className="text-base font-bold text-[#1f2a44]">Need help?</Text>
          <Text className="mt-2 text-sm text-[#63739a]">Our team is available for order, payment, and product support.</Text>
          <Pressable onPress={() => Linking.openURL("mailto:support@babymart.com")} className="mt-3 rounded-2xl bg-[#6f84ec] px-4 py-3">
            <Text className="text-center text-sm font-bold text-white">Email Support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
