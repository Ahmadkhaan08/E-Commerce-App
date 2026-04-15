import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { useState } from "react";
import { Switch, Text, View } from "react-native";

export default function NotificationsScreen() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [offers, setOffers] = useState(true);

  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Notifications" />

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
    </ScreenWrapper>
  );
}
