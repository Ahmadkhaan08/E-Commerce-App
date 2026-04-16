import ProductCard from "@/components/shop/ProductCard";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { addProductToCart, apiRequest, getAuthToken, toggleWishlistProduct } from "@/constants/mobileApi";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useStore } from "@/store/useStore";
import { Product } from "@/types/type";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

type ProductResponse = {
  products: Product[];
  total: number;
};

type WishlistResponse = {
  wishlist: string[];
};

function parseDiscount(value?: string) {
  if (!value) return 0;
  return Number(value.replace("%+", "")) || 0;
}

export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{
    q?: string;
    category?: string;
    brand?: string;
    sort?: string;
    discount?: string;
  }>();

  const refreshCounts = useStore((s) => s.refreshCounts);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCartId, setPendingCartId] = useState<string | null>(null);

  const activeChips = useMemo(
    () => [params.q, params.category ? "Category" : "", params.brand ? "Brand" : "", params.discount].filter(Boolean) as string[],
    [params.brand, params.category, params.discount, params.q],
  );

  const canLoadMore = useMemo(() => products.length < total, [products.length, total]);

  const loadWishlist = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    try {
      const data = await apiRequest<WishlistResponse>("/api/wishlist", undefined, token);
      setWishlistSet(new Set(data.wishlist || []));
    } catch {
      setWishlistSet(new Set());
    }
  }, []);

  const loadResults = useCallback(
    async (targetPage: number, append: boolean) => {
      const query = new URLSearchParams();
      query.set("page", String(targetPage));
      query.set("limit", "10");
      query.set("sortOrder", params.sort === "asc" ? "asc" : "desc");
      if (params.q) query.set("search", params.q);
      if (params.category) query.set("category", params.category);
      if (params.brand) query.set("brand", params.brand);

      const response = await apiRequest<ProductResponse>(`/api/products?${query.toString()}`);
      const discountMin = parseDiscount(params.discount);
      const source = Array.isArray(response.products) ? response.products : [];
      const filtered = discountMin > 0 ? source.filter((item) => (item.discountPercentage ?? 0) >= discountMin) : source;

      setProducts((prev) => (append ? [...prev, ...filtered] : filtered));
      setTotal(response.total || 0);
      setPage(targetPage);
    },
    [params.brand, params.category, params.discount, params.q, params.sort],
  );

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadResults(1, false), loadWishlist()]);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load search results");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [loadResults, loadWishlist]);

  const onLoadMore = async () => {
    if (loading || loadingMore || !canLoadMore) {
      return;
    }

    try {
      setLoadingMore(true);
      await loadResults(page + 1, true);
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
      if (nextWishlisted) {
        showSuccessToast("Wishlist updated", "Added to wishlist.");
      } else {
        showSuccessToast("Wishlist updated", "Removed from wishlist.");
      }
      await refreshCounts();
    } catch {
      showErrorToast("Wishlist update failed", "Please try again.");
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
      showSuccessToast("Added to cart", "Item added successfully.");
      await refreshCounts();
    } catch {
      showErrorToast("Add to cart failed", "Please try again.");
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
        <Text className="text-base font-bold text-gray-800">Search</Text>
        <Pressable onPress={() => router.push({ pathname: "/(main)/filters", params: { q: params.q || "" } })} className="h-8 w-8 items-center justify-center rounded-full bg-[#eef3ff]">
          <Feather name="sliders" size={15} color="#2f3b59" />
        </Pressable>
      </View>

      <View className="px-4 pb-2 pt-3">
        <Text className="text-sm font-bold text-gray-800">{params.q || "Products"}</Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {activeChips.map((chip) => (
            <View key={chip} className="rounded-full bg-white px-3 py-1 shadow-sm">
              <Text className="text-xs text-gray-600">{chip}</Text>
            </View>
          ))}
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
          numColumns={2}
          keyExtractor={(item) => item._id}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 10 }}
          renderItem={({ item }) => (
            <View style={{ width: "48%" }}>
              <ProductCard
                product={item}
                layout="grid"
                wishlisted={wishlistSet.has(item._id)}
                onToggleWishlist={() => toggleWishlist(item._id)}
                onAddToCart={() => addToCart(item._id)}
                addingToCart={pendingCartId === item._id}
                onPress={() => router.push({ pathname: "/(main)/product/[id]", params: { id: item._id } })}
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="mt-20 w-full items-center rounded-2xl bg-white p-6 shadow-sm">
              <Text className="text-sm text-gray-500">No matching products found</Text>
            </View>
          }
          onEndReachedThreshold={0.35}
          onEndReached={onLoadMore}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#7d8ff6" /> : null}
        />
      )}
    </ScreenWrapper>
  );
}
