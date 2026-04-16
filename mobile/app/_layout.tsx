import { Stack } from "expo-router";
import "../global.css"
import { initAuthToken } from "@/constants/mobileApi";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      await initAuthToken();

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
