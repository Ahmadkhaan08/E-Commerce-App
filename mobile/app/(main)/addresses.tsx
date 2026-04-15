import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { apiRequest, getAuthToken } from "@/constants/mobileApi";
import { Address } from "@/types/type";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

type ProfileResponse = { addresses: Address[] };

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await apiRequest<ProfileResponse>("/api/auth/profile", undefined, token);
        setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Addresses" />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}>
        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#7d8ff6" />
          </View>
        ) : addresses.length === 0 ? (
          <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
            <Text className="text-sm text-[#63739a]">No address found. Add one in checkout.</Text>
            <Pressable onPress={() => router.push("/(main)/checkout")} className="mt-3 rounded-2xl bg-[#6f84ec] py-3">
              <Text className="text-center text-sm font-bold text-white">Open Checkout</Text>
            </Pressable>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address._id} className="mb-3 rounded-2xl border border-[#dce7ff] bg-white p-4">
              <Text className="text-sm font-bold text-[#1f2a44]">{address.street}</Text>
              <Text className="mt-1 text-sm text-[#63739a]">{address.city}, {address.country} {address.postalCode}</Text>
              {address.isDefault ? <Text className="mt-2 self-start rounded-full bg-[#eef3ff] px-2 py-1 text-xs font-semibold text-[#4e64cb]">Default</Text> : null}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
