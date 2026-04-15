import React from "react";
import { Pressable, Text, View } from "react-native";
import { Brand } from "@/types/type";
import { Image } from "expo-image";

type BrandListProps = {
  brands: Brand[];
  onSeeAll: () => void;
};

export default function BrandList({ brands, onSeeAll }: BrandListProps) {
  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-[#1f2a44]">Popular Brands</Text>
        <Pressable onPress={onSeeAll}>
          <Text className="text-sm font-semibold mr-2 text-[#7382a8]">See All</Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-2">
        {brands.slice(0, 6).map((brand) => (
          <View key={brand._id} className="items-center rounded-2xl border border-[#dde6ff] bg-white py-2" style={{ width: "31%" }}>
            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#eaf1ff]">
              {brand.image ? (
                <Image source={{ uri: brand.image }} contentFit="cover" style={{ height: "100%", width: "100%" }} />
              ) : (
                <Text className="text-xs font-bold text-[#5f71d9]">{brand.name.slice(0, 2).toUpperCase()}</Text>
              )}
            </View>
            <Text className="mt-1 px-1 text-center text-[10px] font-semibold text-[#1f2a44]" numberOfLines={1}>
              {brand.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
