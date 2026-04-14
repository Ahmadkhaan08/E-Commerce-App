import ProductImageCarousel from "@/components/shop/ProductImageCarousel";
import QuantitySelector from "@/components/shop/QuantitySelector";
import { addProductToCart, apiRequest, getAuthToken, toggleWishlistProduct } from "@/constants/mobileApi";
import { Product } from "@/types/type";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WishlistResponse = {
  success: boolean;
  wishlist: string[];
};

export default function ProductDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!id) {
      setError("Missing product id");
      return;
    }

    try {
      setError(null);
      const productData = await apiRequest<Product>(`/api/products/${id}`);
      setProduct(productData);

      const token = getAuthToken();
      if (token) {
        const wishlistData = await apiRequest<WishlistResponse>("/api/wishlist", undefined, token);
        setIsWishlisted(wishlistData.wishlist.includes(productData._id));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load product details");
    }
  }, [id]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadProduct();
      setLoading(false);
    };

    run();
  }, [loadProduct]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProduct();
    setRefreshing(false);
  }, [loadProduct]);

  const images = useMemo(() => {
    if (product?.image) {
      return [product.image];
    }
    return [];
  }, [product]);

  const addToCart = async () => {
    if (!product) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setActionMessage("Login required to add to cart");
        return;
      }

      await addProductToCart(product._id, quantity, token);
      setActionMessage("Added to cart");
    } catch (requestError) {
      setActionMessage(requestError instanceof Error ? requestError.message : "Failed to add to cart");
    }
  };

  const toggleWishlist = async () => {
    if (!product) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setActionMessage("Login required to update wishlist");
        return;
      }

      const nextWishlisted = await toggleWishlistProduct(product._id, isWishlisted, token);
      setIsWishlisted(nextWishlisted);
      setActionMessage(nextWishlisted ? "Added to wishlist" : "Removed from wishlist");
    } catch (requestError) {
      setActionMessage(requestError instanceof Error ? requestError.message : "Failed to update wishlist");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#edf3ff]">
        <ActivityIndicator size="large" color="#7f8ff5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="h-14 flex-row items-center justify-between border-b border-[#e1e9ff] bg-white px-4">
        <Pressable onPress={() => router.back()} className="h-8 w-8 items-center justify-center rounded-full bg-[#f1f5ff]">
          <Feather name="arrow-left" size={16} color="#1f2a44" />
        </Pressable>
        <Text className="text-base font-bold text-[#1f2a44]">Product Details</Text>
        <View className="flex-row gap-2">
          <Pressable className="h-8 w-8 items-center justify-center rounded-full bg-[#f1f5ff]">
            <Feather name="search" size={15} color="#7583a8" />
          </Pressable>
          <Pressable onPress={toggleWishlist} className="h-8 w-8 items-center justify-center rounded-full bg-[#f1f5ff]">
            <Ionicons name={isWishlisted ? "heart" : "heart-outline"} size={16} color={isWishlisted ? "#ff6f90" : "#7583a8"} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7f8ff5" />}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View className="mb-4 rounded-2xl border border-[#dce7ff] bg-white p-3">
            <Text className="text-xs text-[#6e7a97]">{error}</Text>
          </View>
        ) : null}

        {product ? (
          <>
            <ProductImageCarousel images={images} />

            <Text className="mt-4 text-xl font-extrabold text-[#1f2a44]">{product.name}</Text>
            <Text className="mt-1 text-2xl font-extrabold text-[#1d3257]">Rs. {product.price.toLocaleString("en-PK")}</Text>

            <View className="mt-2 flex-row items-center gap-2">
              <View className="flex-row items-center rounded-full bg-[#f1f5ff] px-3 py-1">
                <Ionicons name="star" size={12} color="#f4b34f" />
                <Text className="ml-1 text-xs font-semibold text-[#6e7a97]">{(product.averageRating ?? 4.6).toFixed(1)}</Text>
              </View>
              <Text className="text-xs text-[#6e7a97]">{product.ratings?.length ?? 0} reviews</Text>
            </View>

            <View className="mt-4 rounded-2xl border border-[#dde6ff] bg-white p-4">
              <Text className="text-sm font-bold text-[#1f2a44]">Description</Text>
              <Text className="mt-2 text-sm leading-6 text-[#6e7a97]" numberOfLines={expanded ? undefined : 3}>
                {product.description}
              </Text>
              <Pressable onPress={() => setExpanded((prev) => !prev)} className="mt-2 self-start rounded-full bg-[#eef3ff] px-3 py-1">
                <Text className="text-xs font-semibold text-[#6678ef]">{expanded ? "Show less" : "Read more"}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View className="mt-12 items-center">
            <Text className="text-sm text-[#6e7a97]">No product data available</Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#dce7ff] bg-white px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        {actionMessage ? <Text className="mb-2 text-xs text-[#6e7a97]">{actionMessage}</Text> : null}
        <View className="flex-row items-center gap-3">
          <QuantitySelector
            quantity={quantity}
            onDecrease={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
            onIncrease={() => setQuantity((prev) => prev + 1)}
          />

          <Pressable onPress={addToCart} className="flex-1 items-center justify-center rounded-2xl bg-[#7f8ff5] py-3">
            <Text className="text-sm font-bold text-white">Add to Cart</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
