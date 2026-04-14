import React from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type PromoBannerProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function PromoBanner({ title, subtitle, onPress }: PromoBannerProps) {
  return (
    <Pressable onPress={onPress} className="mt-4">
      <LinearGradient colors={["#54b5e8", "#7f8ff5"]} style={{ borderRadius: 18, padding: 14 }}>
        <Text className="text-2xl font-extrabold text-white">{title}</Text>
        <Text className="mt-1 text-sm text-[#e8f4ff]">{subtitle}</Text>
        <View className="mt-3 self-start rounded-full bg-[#ffffffd6] px-4 py-2">
          <Text className="text-xs font-bold text-[#25669d]">Shop Now</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
