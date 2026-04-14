import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Banners } from "@/types/type";

type BannerCarouselProps = {
  banners: Banners[];
  onPressShopNow: (banner: Banners) => void;
};

export default function BannerCarousel({ banners, onPressShopNow }: BannerCarouselProps) {
  if (banners.length === 0) {
    return (
      <View className="mt-4">
        <View className="h-44 animate-pulse rounded-3xl bg-[#dce8ff]" />
      </View>
    );
  }

  return (
    <View className="mt-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {banners.map((banner) => (
          <View key={banner._id} className="relative h-44 w-[312px] overflow-hidden rounded-3xl">
            {banner.image ? (
              <Image source={{ uri: banner.image }} contentFit="cover" style={{ height: "100%", width: "100%" }} />
            ) : (
              <LinearGradient colors={["#d8d1ff", "#b8e3ff"]} style={{ flex: 1 }} />
            )}

            <LinearGradient
              colors={["rgba(23,35,64,0.15)", "rgba(23,35,64,0.55)"]}
              style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, padding: 14, justifyContent: "flex-end" }}
            >
              <Text className="text-sm font-semibold text-white/90">{banner.name || "BabyMart"}</Text>
              <Text className="mt-1 text-xl font-extrabold leading-6 text-white" numberOfLines={2}>
                {banner.title || "Comfort picks for little ones"}
              </Text>

              <Pressable onPress={() => onPressShopNow(banner)} className="mt-3 self-start rounded-full bg-[#25b7cb] px-4 py-2">
                <Text className="text-[12px] font-bold text-white">Shop Now</Text>
              </Pressable>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
