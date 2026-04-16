import { apiRequest } from "@/constants/mobileApi";
import { router } from "expo-router";
import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

type RegisterResponse = {
  _id: string;
  name: string;
};

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<"name" | "email" | "password" | "confirmPassword" | null>(null);

  const register = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiRequest<RegisterResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });

      router.replace("/login");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Registration failed");
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
                <Image source={require("@/assets/images/logo.png")} style={{ width: 100, height: 64 }} contentFit="contain" />
                <Text className="mt-3 text-3xl font-extrabold tracking-tight text-[#1f2a44]">Create Account</Text>
                <Text className="mt-2 text-sm text-[#627395]">Join and start shopping today</Text>
              </View>

              <View className="mt-6 gap-3">
                <View
                  className={`flex-row items-center rounded-xl border bg-[#f9fbff] px-4 py-3 ${
                    focusedField === "name" ? "border-[#7c9cff]" : "border-[#d9e2ff]"
                  }`}
                >
                  <User size={18} color="#7f8fb2" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Full name"
                    placeholderTextColor="#96a4c1"
                    className="ml-3 flex-1 text-sm text-[#1f2a44]"
                  />
                </View>

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
                    placeholder="Password"
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

                <View
                  className={`flex-row items-center rounded-xl border bg-[#f9fbff] px-4 py-3 ${
                    focusedField === "confirmPassword" ? "border-[#7c9cff]" : "border-[#d9e2ff]"
                  }`}
                >
                  <Lock size={18} color="#7f8fb2" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Confirm password"
                    placeholderTextColor="#96a4c1"
                    className="ml-3 flex-1 text-sm text-[#1f2a44]"
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    className="rounded-full p-1"
                    android_ripple={{ color: "#d8e2ff", radius: 16 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} color="#6f7fa6" /> : <Eye size={18} color="#6f7fa6" />}
                  </Pressable>
                </View>
              </View>

              {error ? <Text className="mt-3 text-xs text-[#d94972]">{error}</Text> : null}

              <Pressable
                onPress={register}
                disabled={loading}
                android_ripple={{ color: "#c2d4ff" }}
                className="mt-5 items-center justify-center rounded-xl bg-[#7393ff] py-3"
                style={({ pressed }) => ({ opacity: pressed || loading ? 0.86 : 1 })}
              >
                {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-sm font-bold text-white">Register</Text>}
              </Pressable>

              <Pressable
                onPress={() => router.replace("/login")}
                className="mt-4 flex-row items-center justify-center"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-sm text-[#607294]">Already have an account?</Text>
                <ArrowLeft size={14} color="#3f5fd6" style={{ marginRight: 4 }} />
                <Text className="text-sm font-semibold text-[#3f5fd6]">Login</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
