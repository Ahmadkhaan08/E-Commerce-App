import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import QuantitySelector from "./QuantitySelector";

type CartProduct = {
  _id: string;
  name: string;
  image?: string;
  price: number;
};

type CartItemProps = {
  product: CartProduct;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  loading?: boolean;
};

const toPrice = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;

export default function CartItem({
  product,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
  loading = false,
}: CartItemProps) {
  return (
    <View
      className="mb-3 flex-row rounded-2xl border border-[#dde6ff] bg-white p-3"
      style={{
        shadowColor: "#bdcaf0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 2,
        opacity: loading ? 0.6 : 1,
      }}
    >
      <View className="h-16 w-16 overflow-hidden rounded-xl bg-[#ecf3ff]">
        <Image source={product.image ? { uri: product.image } : undefined} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-sm font-bold text-[#1f2a44]" numberOfLines={2}>{product.name}</Text>
        <Text className="mt-1 text-sm font-extrabold text-[#1f2a44]">{toPrice(product.price)}</Text>
        <View className="mt-2 flex-row items-center justify-between">
          <QuantitySelector quantity={quantity} onDecrease={onDecrease} onIncrease={onIncrease} />
          <Pressable
            onPress={onRemove}
            disabled={loading}
            className="h-8 w-8 items-center justify-center rounded-full bg-[#f1f5ff]"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#7583a8" />
            ) : (
              <Feather name="trash-2" size={14} color="#7583a8" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
