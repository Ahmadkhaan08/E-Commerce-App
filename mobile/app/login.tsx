import { apiRequest, setAuthToken } from "@/constants/mobileApi";
import { router } from "expo-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, CircleHelp, ArrowRight } from "lucide-react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

type LoginResponse = {
  _id: string;
  name: string;
  token: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

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
      router.replace("/(main)/" as any);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f0f6ff", "#f4f0ff", "#ffffff"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-8" keyboardShouldPersistTaps="handled">
            <View className="rounded-2xl bg-white p-6 shadow-md">
              <View className="items-center">
                <Image source={require("@/assets/images/logo.png")} style={{ width: 100, height: 68 }} contentFit="contain" />
                <Text className="mt-3 text-3xl font-extrabold tracking-tight text-[#1f2a44]">Welcome Back</Text>
                <Text className="mt-2 text-sm text-[#627395]">Login to your account</Text>
              </View>

              <View className="mt-6 gap-3">
                <View
                  className={`flex-row items-center rounded-xl border bg-[#f9fbff] px-4 py-3 ${
                    focusedField === "email" ? "border-[#7c9cff]" : "border-[#d9e2ff]"
                  }`}
                >
                  <Mail size={18} color="#7f8fb2" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor="#96a4c1"
                    className="ml-3 flex-1 text-sm text-[#1f2a44]"
                  />
                </View>

                <View
                  className={`flex-row items-center rounded-xl border bg-[#f9fbff] px-4 py-3 ${
                    focusedField === "password" ? "border-[#7c9cff]" : "border-[#d9e2ff]"
                  }`}
                >
                  <Lock size={18} color="#7f8fb2" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#96a4c1"
                    className="ml-3 flex-1 text-sm text-[#1f2a44]"
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    className="rounded-full p-1"
                    android_ripple={{ color: "#d8e2ff", radius: 16 }}
                  >
                    {showPassword ? <EyeOff size={18} color="#6f7fa6" /> : <Eye size={18} color="#6f7fa6" />}
                  </Pressable>
                </View>
              </View>

              {error ? <Text className="mt-3 text-xs text-[#d94972]">{error}</Text> : null}

              <Pressable
                onPress={login}
                disabled={loading}
                android_ripple={{ color: "#c2d4ff" }}
                className="mt-5 items-center justify-center rounded-xl bg-[#7393ff] py-3"
                style={({ pressed }) => ({ opacity: pressed || loading ? 0.86 : 1 })}
              >
                {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-sm font-bold text-white">Login</Text>}
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Forgot Password", "Password reset is coming soon.")}
                className="mt-4 flex-row items-center justify-center"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <CircleHelp size={14} color="#607294" />
                <Text className="ml-1 text-sm font-medium text-[#607294]">Forgot Password?</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/register")}
                className="mt-4 flex-row items-center justify-center"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-sm text-[#607294]">Don&apos;t have an account?</Text>
                <Text className="ml-1 text-sm font-semibold text-[#3f5fd6]">Register</Text>
                <ArrowRight size={14} color="#3f5fd6" style={{ marginLeft: 4 }} />
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
