import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Switch, Text, View } from "react-native";
import { useState } from "react";

export default function NotificationsScreen() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [offers, setOffers] = useState(true);

  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="h-14 flex-row items-center justify-between border-b border-[#dbe6ff] bg-white px-4">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-full bg-[#eef3ff]">
          <Feather name="arrow-left" size={17} color="#2f3b59" />
        </Pressable>
        <Text className="text-lg font-bold text-[#1f2a44]">Notifications</Text>
        <View className="h-9 w-9" />
      </View>

      <View className="p-4">
        <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
          <View className="flex-row items-center justify-between border-b border-[#e8eeff] pb-3">
            <Text className="text-sm font-semibold text-[#1f2a44]">Order updates</Text>
            <Switch value={orderUpdates} onValueChange={setOrderUpdates} />
          </View>
          <View className="flex-row items-center justify-between pt-3">
            <Text className="text-sm font-semibold text-[#1f2a44]">Offers and deals</Text>
            <Switch value={offers} onValueChange={setOffers} />
          </View>
        </View>
      </View>
    </View>
  );
}
