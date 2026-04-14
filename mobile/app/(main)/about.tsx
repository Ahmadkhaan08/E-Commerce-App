import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function AboutScreen() {
  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="h-14 flex-row items-center justify-between border-b border-[#dbe6ff] bg-white px-4">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-full bg-[#eef3ff]">
          <Feather name="arrow-left" size={17} color="#2f3b59" />
        </Pressable>
        <Text className="text-lg font-bold text-[#1f2a44]">About Us</Text>
        <View className="h-9 w-9" />
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}>
        <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
          <Text className="text-base font-bold text-[#1f2a44]">BabyMart Mobile</Text>
          <Text className="mt-2 text-sm leading-6 text-[#63739a]">
            We make baby shopping simple, safe, and delightful for families. From daily essentials to trusted care products, our goal is a reliable mobile shopping experience.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
