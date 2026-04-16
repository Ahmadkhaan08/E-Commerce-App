import { Stack } from "expo-router";
import "../global.css"
import { initAuthToken } from "@/constants/mobileApi";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import { isNativeStripeAvailable, safeInitStripe } from "@/lib/stripeClient";

const queryClient = new QueryClient();
const stripePublishableKey =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  (Constants.expoConfig?.extra?.stripePublishableKey as string | undefined) ||
  "";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      await initAuthToken();

      if (Platform.OS !== "web" && stripePublishableKey.trim() && isNativeStripeAvailable()) {
        await safeInitStripe({
          publishableKey: stripePublishableKey,
          merchantIdentifier: Platform.OS === "ios" ? "merchant.com.bachabazar" : undefined,
        });
      }

      setReady(true);
    };

    bootstrap();
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-[#edf3ff]">
        <ActivityIndicator size="large" color="#7f8ff5" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
