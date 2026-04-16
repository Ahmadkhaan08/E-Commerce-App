import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { getAuthToken, getMyProfile, updateMyProfile } from "@/constants/mobileApi";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileScreen() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getMyProfile(token);
        setUserId(data._id || "");
        setName(data.name || "");
        setEmail(data.email || "");
        setAvatar(data.avatar || "");
      } catch (requestError) {
        showErrorToast("Could not load profile", requestError instanceof Error ? requestError.message : undefined);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const pickAvatar = async () => {
    try {
      setAvatarUploading(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showErrorToast("Permission required", "Please allow photo library access to update avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const selected = result.assets[0];
      if (selected.base64) {
        const mimeType = selected.mimeType || "image/jpeg";
        setAvatar(`data:${mimeType};base64,${selected.base64}`);
      } else if (selected.uri) {
        setAvatar(selected.uri);
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveChanges = async () => {
    if (!userId) {
      showErrorToast("Profile not ready", "Please wait and try again.");
      return;
    }

    if (!name.trim()) {
      showErrorToast("Name required", "Please enter your name.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateMyProfile(
        {
          name: name.trim(),
          email: email.trim() || undefined,
          avatar: avatar || undefined,
        },
        token,
      );

      setName(updated.name || name.trim());
      setEmail(updated.email || email);
      setAvatar(updated.avatar || avatar);
      showSuccessToast("Profile updated", "Your changes were saved successfully.");
    } catch (requestError) {
      showErrorToast("Profile update failed", requestError instanceof Error ? requestError.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
            <View className="items-center">
              <View className="h-24 w-24 overflow-hidden rounded-full border border-[#dbe6ff] bg-[#edf4ff]">
                {avatar ? (
                  <Image source={{ uri: avatar }} contentFit="cover" style={{ width: "100%", height: "100%" }} />
                ) : (
                  <View className="h-full w-full items-center justify-center">
                    <Text className="text-3xl font-bold text-[#627395]">{name.slice(0, 1).toUpperCase() || "U"}</Text>
                  </View>
                )}
              </View>

              <Pressable
                onPress={pickAvatar}
                disabled={avatarUploading || saving}
                className="mt-3 rounded-xl bg-[#e8eeff] px-4 py-2"
                style={({ pressed }) => ({ opacity: pressed || avatarUploading || saving ? 0.75 : 1 })}
              >
                <Text className="text-xs font-semibold text-[#3e56b3]">{avatarUploading ? "Uploading..." : "Upload Avatar"}</Text>
              </Pressable>
            </View>

            <Text className="mb-2 text-xs font-semibold text-[#7382a8]">Name</Text>
            <TextInput value={name} onChangeText={setName} className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] px-3 py-3 text-base text-[#1f2a44]" />
            <Text className="mb-2 mt-4 text-xs font-semibold text-[#7382a8]">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="rounded-xl border border-[#dbe6ff] bg-[#f8fbff] px-3 py-3 text-base text-[#1f2a44]"
            />

            <Pressable
              onPress={saveChanges}
              disabled={saving || avatarUploading}
              className="mt-5 items-center justify-center rounded-2xl bg-[#6f84ec] py-3"
              style={({ pressed }) => ({ opacity: pressed || saving || avatarUploading ? 0.82 : 1 })}
            >
              {saving ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-sm font-bold text-white">Save Changes</Text>}
            </Pressable>
          </View>
        </View>
      )}
     </ScreenWrapper>
  );
}
