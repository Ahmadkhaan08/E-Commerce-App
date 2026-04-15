import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useStore } from "@/store/useStore";

export default function FloatingCart() {
  const cartCount = useStore((s) => s.cartCount);
  const pathname = usePathname();

  // Hide on the cart screen itself
  if (pathname === "/cart" || pathname === "/(main)/cart") {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.push("/(main)/cart")}
      className="absolute bottom-[110px] right-5 h-14 w-14 items-center justify-center rounded-full bg-[#4b63df]"
      style={{
        shadowColor: "#3a50c2",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      <Feather name="shopping-cart" size={20} color="#ffffff" />
      {cartCount > 0 ? (
        <View className="absolute -right-1 -top-1 min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#ff4d6d] px-1">
          <Text className="text-[10px] font-bold text-white">
            {cartCount > 99 ? "99+" : cartCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
