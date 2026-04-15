import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { ScrollView, Text, View } from "react-native";

export default function AboutScreen() {
  return (
    // <ScreenWrapper>
    <>
      <InnerScreenHeader title="About Us" />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}>
        <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
          <Text className="text-base font-bold text-[#1f2a44]">BabyMart Mobile</Text>
          <Text className="mt-2 text-sm leading-6 text-[#63739a]">
            We make baby shopping simple, safe, and delightful for families. From daily essentials to trusted care products, our goal is a reliable mobile shopping experience.
          </Text>
        </View>
      </ScrollView>
    </>
    // </ScreenWrapper>
  );
}
