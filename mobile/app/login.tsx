import { apiRequest, setAuthToken } from "@/constants/mobileApi";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

type LoginResponse = {
  _id: string;
  name: string;
  token: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiRequest<LoginResponse>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      await setAuthToken(data.token);
      router.replace("/(main)/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#edf3ff] px-6 pt-16">
      <Text className="text-3xl font-extrabold text-[#1f2a44]">Welcome Back</Text>
      <Text className="mt-2 text-sm text-[#6e7a97]">Login to sync cart, wishlist, and profile data.</Text>

      <View className="mt-8 rounded-3xl border border-[#dce7ff] bg-white p-5">
        <Text className="mb-2 text-xs font-semibold text-[#7382a8]">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#94a0bc"
          className="rounded-2xl border border-[#dbe6ff] bg-[#f8fbff] px-3 py-3 text-sm text-[#1f2a44]"
        />

        <Text className="mb-2 mt-4 text-xs font-semibold text-[#7382a8]">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#94a0bc"
          className="rounded-2xl border border-[#dbe6ff] bg-[#f8fbff] px-3 py-3 text-sm text-[#1f2a44]"
        />

        {error ? <Text className="mt-3 text-xs text-[#d94972]">{error}</Text> : null}

        <Pressable onPress={login} disabled={loading} className="mt-5 items-center justify-center rounded-2xl bg-[#7f8ff5] py-3">
          {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-sm font-bold text-white">Login</Text>}
        </Pressable>
      </View>
    </View>
  );
}
