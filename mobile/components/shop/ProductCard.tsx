import React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@/types/type";

type ProductCardProps = {
  product: Product;
  wishlisted?: boolean;
  onPress?: () => void;
  onToggleWishlist?: () => void;
  onAddToCart?: () => void;
  addingToCart?: boolean;
  layout?: "grid" | "list" | "horizontal";
};

const toPrice = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;

export default function ProductCard({
  product,
  wishlisted = false,
  onPress,
  onToggleWishlist,
  onAddToCart,
  addingToCart = false,
  layout = "grid",
}: ProductCardProps) {
  const containerClass =
    layout === "list"
      ? "flex-row rounded-3xl border border-[#dce6ff] bg-white p-4 shadow-sm"
      : layout === "horizontal"
        ? "w-44 rounded-3xl border border-[#dce6ff] bg-white p-3 shadow-sm"
        : "rounded-3xl border border-[#dce6ff] bg-white p-3 shadow-sm";

  const imageClass = layout === "list" ? "h-28 w-28" : layout === "horizontal" ? "h-28 w-full" : "h-36 w-full";

  const oldPrice = Math.round(product.price * (1 + (product.discountPercentage ?? 0) / 100));

  return (
    <Pressable onPress={onPress} className={containerClass}>
      <View className={`overflow-hidden rounded-xl bg-[#edf4ff] ${imageClass}`}>
        {product.image ? <Image source={{ uri: product.image }} contentFit="cover" style={{ width: "100%", height: "100%" }} /> : null}
      </View>

      <View className={layout === "list" ? "ml-3 flex-1" : "mt-2"}>
        <View className="flex-row items-start justify-between">
          <Text className="flex-1 pr-2 text-base font-bold text-[#1f2a44]" numberOfLines={2}>
            {product.name}
          </Text>
          {onToggleWishlist ? (
            <Pressable onPress={onToggleWishlist} className="h-8 w-8 items-center justify-center rounded-full bg-[#f2f6ff]">
              <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={17} color={wishlisted ? "#f05a7e" : "#7082b3"} />
            </Pressable>
          ) : null}
        </View>

        <View className="mt-3 flex-row items-center gap-2">
          <Text className="text-lg font-extrabold text-[#30438f]">{toPrice(product.price)}</Text>
          {(product.discountPercentage ?? 0) > 0 ? (
            <Text className="text-sm text-gray-400 line-through">{toPrice(oldPrice)}</Text>
          ) : null}
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          {(product.discountPercentage ?? 0) > 0 ? (
            <Text className="rounded-full bg-[#ffe8ef] px-2 py-1 text-xs font-semibold text-[#d84f79]">
              {product.discountPercentage}% OFF
            </Text>
          ) : (
            <View />
          )}
          <Text className="text-sm text-gray-500">{(product.averageRating ?? 0).toFixed(1)} ★</Text>
        </View>

        {onAddToCart ? (
          <Pressable
            onPress={onAddToCart}
            disabled={addingToCart}
            className="mt-3 items-center rounded-2xl bg-[#6d84ef] py-2.5"
          >
            <Text className="text-sm font-bold text-white">{addingToCart ? "Adding..." : "Add to Cart"}</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
