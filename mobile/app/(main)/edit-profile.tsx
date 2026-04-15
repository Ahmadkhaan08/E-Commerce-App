import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { apiRequest, getAuthToken } from "@/constants/mobileApi";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

type ProfileResponse = { name: string; email: string };

export default function EditProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        setName(data.name || "");
        setEmail(data.email || "");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Edit Profile" />

      {loading ? (
        <View className="mt-16 items-center">
          <ActivityIndicator size="large" color="#7d8ff6" />
        </View>
      ) : (
        <View className="p-4">
          <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
            <Text className="mb-2 text-xs font-semibold text-[#7382a8]">Name</Text>
            <TextInput value={name} onChangeText={setName} className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] px-3 py-3 text-base text-[#1f2a44]" />
            <Text className="mb-2 mt-4 text-xs font-semibold text-[#7382a8]">Email</Text>
            <TextInput value={email} editable={false} className="rounded-xl border border-[#dbe6ff] bg-[#eef3ff] px-3 py-3 text-base text-[#6e7a97]" />
            <Text className="mt-3 text-sm text-[#63739a]">Profile update endpoint is not available in current backend routes. Contact support to update account details.</Text>
          </View>
        </View>
      )}
     </ScreenWrapper>
  );
}
