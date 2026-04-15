import ProductCard from "@/components/shop/ProductCard";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { addProductToCart, apiRequest, getAuthToken, toggleWishlistProduct } from "@/constants/mobileApi";
import { useStore } from "@/store/useStore";
import { Product } from "@/types/type";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";

type ProductResponse = {
  products: Product[];
  total: number;
};

type WishlistResponse = {
  wishlist: string[];
};

export default function ProductListingScreen() {
  const params = useLocalSearchParams<{ category?: string; brand?: string; title?: string }>();
  const refreshCounts = useStore((s) => s.refreshCounts);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingCartId, setPendingCartId] = useState<string | null>(null);

  const canLoadMore = useMemo(() => products.length < total, [products.length, total]);

  const loadProducts = useCallback(
    async (targetPage: number, append: boolean) => {
      const query = new URLSearchParams();
      query.set("page", String(targetPage));
      query.set("limit", "10");
      query.set("sortOrder", "desc");
      if (params.category) query.set("category", params.category);
      if (params.brand) query.set("brand", params.brand);
      if (search.trim()) query.set("search", search.trim());

      const data = await apiRequest<ProductResponse>(`/api/products?${query.toString()}`);
      const next = Array.isArray(data.products) ? data.products : [];
      setProducts((prev) => (append ? [...prev, ...next] : next));
      setTotal(data.total || 0);
      setPage(targetPage);
    },
    [params.brand, params.category, search],
  );

  const loadWishlist = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setWishlistSet(new Set());
      return;
    }

    try {
      const data = await apiRequest<WishlistResponse>("/api/wishlist", undefined, token);
      setWishlistSet(new Set(data.wishlist || []));
    } catch {
      setWishlistSet(new Set());
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadProducts(1, false), loadWishlist()]);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [loadProducts, loadWishlist]);

  const onLoadMore = async () => {
    if (loadingMore || loading || !canLoadMore) {
      return;
    }

    try {
      setLoadingMore(true);
      await loadProducts(page + 1, true);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const wishlisted = wishlistSet.has(productId);

    try {
      const nextWishlisted = await toggleWishlistProduct(productId, wishlisted, token);
      setWishlistSet((prev) => {
        const next = new Set(prev);
        if (nextWishlisted) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
      setMessage(nextWishlisted ? "Added to wishlist" : "Removed from wishlist");
      await refreshCounts();
    } catch {
      setMessage("Could not update wishlist");
    }
  };

  const addToCart = async (productId: string) => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setPendingCartId(productId);
      await addProductToCart(productId, 1, token);
      setMessage("Added to cart");
      await refreshCounts();
    } catch {
      setMessage("Could not add to cart");
    } finally {
      setPendingCartId(null);
    }
  };

  return (
    <ScreenWrapper>
      <View className="h-14 flex-row items-center justify-between border-b border-[#dbe6ff] bg-white px-4">
        <Pressable onPress={() => router.back()} className="h-8 w-8 items-center justify-center rounded-full bg-[#eef3ff]">
          <Feather name="arrow-left" size={16} color="#2f3b59" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-800">{params.title || "Product Listing"}</Text>
        <Pressable onPress={() => router.push("/(main)/wishlist")} className="h-8 w-8 items-center justify-center rounded-full bg-[#eef3ff]">
          <Ionicons name="heart-outline" size={15} color="#2f3b59" />
        </Pressable>
      </View>

      <View className="px-4 pb-2 pt-3">
        <View className="flex-row items-center rounded-full bg-white px-3 py-2 shadow-sm">
          <Feather name="search" size={15} color="#7f8fb8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search in this list"
            className="ml-2 flex-1 text-sm text-gray-800"
            onSubmitEditing={() => loadProducts(1, false)}
          />
        </View>
      </View>

      {loading ? (
        <View className="mt-16 items-center">
          <ActivityIndicator size="large" color="#7d8ff6" />
        </View>
      ) : error ? (
        <View className="mx-4 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="text-sm text-gray-500">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 10 }}
          ListHeaderComponent={
            message ? (
              <View className="mb-3 rounded-2xl border border-[#dce7ff] bg-white p-3">
                <Text className="text-sm text-[#5f6f94]">{message}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              layout="list"
              wishlisted={wishlistSet.has(item._id)}
              onToggleWishlist={() => toggleWishlist(item._id)}
              onAddToCart={() => addToCart(item._id)}
              addingToCart={pendingCartId === item._id}
              onPress={() => router.push({ pathname: "/(main)/product/[id]", params: { id: item._id } })}
            />
          )}
          onEndReachedThreshold={0.3}
          onEndReached={onLoadMore}
          ListEmptyComponent={
            <View className="mt-20 items-center rounded-2xl bg-white p-6 shadow-sm">
              <Text className="text-sm text-gray-500">No products found</Text>
            </View>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#7d8ff6" /> : null}
        />
      )}
    </ScreenWrapper>
  );
}
