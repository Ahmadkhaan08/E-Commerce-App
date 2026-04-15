import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Product } from "@/types/type";
import { Image } from "expo-image";
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SkeletonBox from "@/skeleton/SkeletonBox";

type ProductSliderProps = {
  title: string;
  products: Product[];
  onSeeAll: () => void;
  loading?: boolean;
  wishlistSet?: Set<string>;
  pendingCartId?: string | null;
  onToggleWishlist?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onProductPress?: (productId: string) => void;
};

const toPrice = (price?: number) => `Rs. ${(price ?? 0).toLocaleString("en-PK")}`;

function SliderSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10 }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <View
          key={i}
          className="w-[160px] rounded-2xl border border-[#e2eaff] bg-white p-2"
        >
          <SkeletonBox width="100%" height={96} borderRadius={12} />
          <SkeletonBox width="70%" height={10} borderRadius={6} style={{ marginTop: 8 }} />
          <SkeletonBox width="50%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
          <SkeletonBox width="100%" height={28} borderRadius={12} style={{ marginTop: 8 }} />
        </View>
      ))}
    </ScrollView>
  );
}

export default function ProductSlider({
  title,
  products,
  onSeeAll,
  loading = false,
  wishlistSet,
  pendingCartId,
  onToggleWishlist,
  onAddToCart,
  onProductPress,
}: ProductSliderProps) {
  const showSkeleton = loading && products.length === 0;

  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-[#1f2a44]">{title}</Text>
        <Pressable onPress={onSeeAll}>
          <Text className="mr-2 text-sm font-semibold text-[#7382a8]">See All</Text>
        </Pressable>
      </View>

      {showSkeleton ? (
        <SliderSkeleton />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {(products.length > 0 ? products : []).map((product) => {
            const isWishlisted = wishlistSet?.has(product._id) ?? false;
            const isAddingToCart = pendingCartId === product._id;

            return (
              <Pressable
                key={product._id}
                onPress={() => onProductPress?.(product._id)}
                className="w-[160px] rounded-2xl border border-[#dfe8ff] bg-white p-2"
                style={{
                  shadowColor: "#becbf0",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                {/* Image + Wishlist Heart */}
                <View className="relative">
                  <View className="h-24 w-full overflow-hidden rounded-xl bg-[#eaf2ff]">
                    {product.image ? (
                      <Image source={{ uri: product.image }} contentFit="cover" style={{ height: "100%", width: "100%" }} />
                    ) : (
                      <View className="h-full items-center justify-center">
                        <MaterialCommunityIcons name="baby-bottle-outline" size={20} color="#6777e8" />
                      </View>
                    )}
                  </View>

                  {onToggleWishlist ? (
                    <Pressable
                      onPress={() => onToggleWishlist(product._id)}
                      className="absolute right-1 top-1 h-7 w-7 items-center justify-center rounded-full bg-[#eff4ff]"
                    >
                      <Ionicons
                        name={isWishlisted ? "heart" : "heart-outline"}
                        size={15}
                        color={isWishlisted ? "#f05a7e" : "#7082b3"}
                      />
                    </Pressable>
                  ) : null}
                </View>

                {/* Discount Badge */}
                {(product.discountPercentage ?? 0) > 0 ? (
                  <Text className="mt-1 self-start rounded-full bg-[#ff6f90] px-2 py-[2px] text-[9px] font-bold text-white">
                    {product.discountPercentage}% OFF
                  </Text>
                ) : null}

                {/* Name */}
                <Text className="mt-1 min-h-[26px] text-[10px] font-semibold leading-3 text-[#1f2a44]" numberOfLines={2}>
                  {product.name}
                </Text>

                {/* Price + Rating */}
                <View className="mt-1 flex-row items-center justify-between">
                  <Text className="text-xs font-extrabold text-[#1f2a44]">{toPrice(product.price)}</Text>
                  <View className="flex-row items-center">
                    <AntDesign name="star" size={9} color="#f4b34f" />
                    <Text className="ml-0.5 text-[9px] font-semibold text-[#6e7a97]">
                      {(product.averageRating ?? 4.6).toFixed(1)}
                    </Text>
                  </View>
                </View>

                {/* Add to Cart Button */}
                {onAddToCart ? (
                  <Pressable
                    onPress={() => onAddToCart(product._id)}
                    disabled={isAddingToCart}
                    className="mt-2 flex-row items-center justify-center rounded-xl bg-[#6d84ef] py-1.5"
                  >
                    {isAddingToCart ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-[10px] font-bold text-white">Add to Cart</Text>
                    )}
                  </Pressable>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
