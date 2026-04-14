import WishlistItem from "@/components/shop/WishlistItem";
import { addProductToCart, apiRequest, getAuthToken } from "@/constants/mobileApi";
import { Product } from "@/types/type";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

type WishlistResponse = {
  success: boolean;
  wishlist: string[];
};

type WishlistProductsResponse = {
  success: boolean;
  products: Product[];
};

export default function WishlistScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthReady(true);
  }, []);

  const loadWishlist = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      setError(null);
      const wishlistData = await apiRequest<WishlistResponse>("/api/wishlist", undefined, token);

      if (!Array.isArray(wishlistData.wishlist) || wishlistData.wishlist.length === 0) {
        setProducts([]);
        return;
      }

      const productsData = await apiRequest<WishlistProductsResponse>(
        "/api/wishlist/get-products",
        {
          method: "POST",
          body: JSON.stringify({ productIds: wishlistData.wishlist }),
        },
        token,
      );

      setProducts(Array.isArray(productsData.products) ? productsData.products : []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load wishlist");
    }
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    const run = async () => {
      setLoading(true);
      await loadWishlist();
      setLoading(false);
    };

    run();
  }, [authReady, loadWishlist]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  }, [loadWishlist]);

  const removeFromWishlist = async (productId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      await apiRequest<{ success: boolean }>(
        "/api/wishlist/remove",
        {
          method: "DELETE",
          body: JSON.stringify({ productId }),
        },
        token,
      );

      setMessage("Item removed from wishlist");
      await loadWishlist();
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : "Failed to remove item");
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      await addProductToCart(productId, 1, token);

      setMessage("Added to cart");
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : "Failed to add to cart");
    }
  };

  if (!authReady) {
    return (
      <View className="flex-1 items-center justify-center bg-[#edf3ff]">
        <ActivityIndicator size="large" color="#7f8ff5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="h-14 flex-row items-center justify-between border-b border-[#e1e9ff] bg-white px-4">
        <Text className="text-lg font-bold text-[#1f2a44]">Wishlist</Text>
        <Pressable>
          <Text className="text-xs font-semibold text-[#7382a8]">See All</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7f8ff5" />}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 20 }}
      >
        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#7f8ff5" />
          </View>
        ) : null}

        {error ? (
          <View className="mb-4 rounded-2xl border border-[#dce7ff] bg-white p-3">
            <Text className="text-xs text-[#6e7a97]">{error}</Text>
          </View>
        ) : null}

        {message ? (
          <View className="mb-4 rounded-2xl border border-[#dce7ff] bg-white p-3">
            <Text className="text-xs text-[#6e7a97]">{message}</Text>
          </View>
        ) : null}

        {!loading && products.length === 0 ? (
          <View className="mt-16 items-center rounded-2xl border border-[#dce7ff] bg-white p-6">
            <Text className="text-sm text-[#6e7a97]">No wishlist items yet</Text>
          </View>
        ) : null}

        {products.map((product) => (
          <WishlistItem
            key={product._id}
            id={product._id}
            name={product.name}
            image={product.image}
            price={product.price}
            onRemove={removeFromWishlist}
            onAddToCart={addToCart}
          />
        ))}
      </ScrollView>
    </View>
  );
}
