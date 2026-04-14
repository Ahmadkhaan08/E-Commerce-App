import React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

type WishlistItemProps = {
  id: string;
  name: string;
  image?: string;
  price: number;
  onRemove: (id: string) => void;
  onAddToCart: (id: string) => void;
};

const toPrice = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;

export default function WishlistItem({ id, name, image, price, onRemove, onAddToCart }: WishlistItemProps) {
  return (
    <View
      className="mb-3 rounded-2xl border border-[#dde6ff] bg-white p-3"
      style={{
        shadowColor: "#bdcaf0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="flex-row">
        <View className="h-16 w-16 overflow-hidden rounded-xl bg-[#ecf3ff]">
          <Image source={image ? { uri: image } : undefined} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-sm font-bold text-[#1f2a44]" numberOfLines={2}>{name}</Text>
          <Text className="mt-1 text-sm font-extrabold text-[#1f2a44]">{toPrice(price)}</Text>

          <View className="mt-2 flex-row items-center gap-2">
            <Pressable onPress={() => onAddToCart(id)} className="rounded-full bg-[#dde8ff] px-3 py-2">
              <Text className="text-xs font-bold text-[#305180]">Add to Cart</Text>
            </Pressable>
            <Pressable onPress={() => onRemove(id)} className="h-8 w-8 items-center justify-center rounded-full bg-[#f1f5ff]">
              <Feather name="trash-2" size={14} color="#7583a8" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
