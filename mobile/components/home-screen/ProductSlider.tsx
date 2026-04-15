import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Product } from "@/types/type";
import { Image } from "expo-image";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

type ProductSliderProps = {
  title: string;
  products: Product[];
  onSeeAll: () => void;
};

const toPrice = (price?: number) => `Rs. ${(price ?? 0).toLocaleString("en-PK")}`;

export default function ProductSlider({ title, products, onSeeAll }: ProductSliderProps) {
  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-[#1f2a44]">{title}</Text>
        <Pressable onPress={onSeeAll}>
          <Text className="text-sm font-semibold mr-2 text-[#7382a8]">See All</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {(products.length > 0 ? products : []).map((product) => (
          <Pressable
            key={product._id}
            className="w-[122px] rounded-2xl border border-[#dfe8ff] bg-white p-2"
            style={{
              shadowColor: "#becbf0",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <View className="h-20 w-full overflow-hidden rounded-xl bg-[#eaf2ff]">
              {product.image ? (
                <Image source={{ uri: product.image }} contentFit="cover" style={{ height: "100%", width: "100%" }} />
              ) : (
                <View className="h-full items-center justify-center">
                  <MaterialCommunityIcons name="baby-bottle-outline" size={20} color="#6777e8" />
                </View>
              )}
            </View>

            {(product.discountPercentage ?? 0) > 0 ? (
              <Text className="mt-1 self-start rounded-full bg-[#ff6f90] px-2 py-[2px] text-[9px] font-bold text-white">
                {product.discountPercentage}% OFF
              </Text>
            ) : null}

            <Text className="mt-1 min-h-[26px] text-[10px] font-semibold leading-3 text-[#1f2a44]" numberOfLines={2}>
              {product.name}
            </Text>
            <Text className="mt-1 text-xs font-extrabold text-[#1f2a44]">{toPrice(product.price)}</Text>
            <View className="mt-1 flex-row items-center">
              <AntDesign name="star" size={10} color="#f4b34f" />
              <Text className="ml-1 text-[10px] font-semibold text-[#6e7a97]">{(product.averageRating ?? 4.6).toFixed(1)}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
