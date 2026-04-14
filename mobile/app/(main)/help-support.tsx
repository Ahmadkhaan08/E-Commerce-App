import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

export default function HelpSupportScreen() {
  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="h-14 flex-row items-center justify-between border-b border-[#dbe6ff] bg-white px-4">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-full bg-[#eef3ff]">
          <Feather name="arrow-left" size={17} color="#2f3b59" />
        </Pressable>
        <Text className="text-lg font-bold text-[#1f2a44]">Help & Support</Text>
        <View className="h-9 w-9" />
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}>
        <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
          <Text className="text-base font-bold text-[#1f2a44]">Need help?</Text>
          <Text className="mt-2 text-sm text-[#63739a]">Our team is available for order, payment, and product support.</Text>
          <Pressable onPress={() => Linking.openURL("mailto:support@babymart.com")} className="mt-3 rounded-2xl bg-[#6f84ec] px-4 py-3">
            <Text className="text-center text-sm font-bold text-white">Email Support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
