import WishlistItem from "@/components/shop/WishlistItem";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import SkeletonBox from "@/skeleton/SkeletonBox";
import {
  addProductToCart,
  apiRequest,
  getAuthToken,
} from "@/constants/mobileApi";
import { useStore } from "@/store/useStore";
import { Product } from "@/types/type";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";

type WishlistResponse = {
  success: boolean;
  wishlist: string[];
};

type WishlistProductsResponse = {
  success: boolean;
  products: Product[];
};

function WishlistSkeleton() {
  return (
    <View>
      {Array.from({ length: 4 }).map((_, i) => (
        <View
          key={i}
          className="mb-3 rounded-2xl border border-[#dde6ff] bg-white p-3"
        >
          <View className="flex-row">
            <SkeletonBox width={64} height={64} borderRadius={12} />
            <View className="ml-3 flex-1">
              <SkeletonBox width="75%" height={14} borderRadius={6} />
              <SkeletonBox width="35%" height={14} borderRadius={6} style={{ marginTop: 6 }} />
              <View className="mt-3 flex-row items-center gap-2">
                <SkeletonBox width={90} height={30} borderRadius={16} />
                <SkeletonBox width={32} height={32} borderRadius={16} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function WishlistScreen() {
  const refreshCounts = useStore((s) => s.refreshCounts);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [pendingCartId, setPendingCartId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthReady(true);
  }, []);

  // Auto-dismiss feedback message
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const loadWishlist = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      setError(null);
      const wishlistData = await apiRequest<WishlistResponse>(
        "/api/wishlist",
        undefined,
        token,
      );

      if (
        !Array.isArray(wishlistData.wishlist) ||
        wishlistData.wishlist.length === 0
      ) {
        setProducts([]);
        await refreshCounts();
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

      setProducts(
        Array.isArray(productsData.products) ? productsData.products : [],
      );
      await refreshCounts();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load wishlist",
      );
    }
  }, [refreshCounts]);

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

      setPendingRemoveId(productId);
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
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : "Failed to remove item",
      );
    } finally {
      setPendingRemoveId(null);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      setPendingCartId(productId);
      await addProductToCart(productId, 1, token);
      await refreshCounts();

      setMessage("Added to cart 🛒");
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : "Failed to add to cart",
      );
    } finally {
      setPendingCartId(null);
    }
  };

  if (!authReady) {
    return (
      <View className="flex-1 items-center justify-center bg-[#edf3ff]">
        <SkeletonBox width={48} height={48} borderRadius={24} />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View className="flex-1 bg-[#edf3ff]">
        <InnerScreenHeader title="Wishlist" />

        <ScrollView
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7f8ff5"
            />
          }
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 20 }}
        >
          {loading ? <WishlistSkeleton /> : null}

          {error ? (
            <View className="mb-4 rounded-2xl border border-[#dce7ff] bg-white p-3">
              <Text className="text-xs text-[#6e7a97]">{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View className="mb-4 rounded-2xl border border-[#c8dcff] bg-[#eaf2ff] px-4 py-2.5">
              <Text className="text-center text-xs font-semibold text-[#3b5998]">{message}</Text>
            </View>
          ) : null}

          {!loading && products.length === 0 ? (
            <View className="mt-16 items-center rounded-2xl border border-[#dce7ff] bg-white p-6">
              <Text className="text-sm text-[#6e7a97]">
                No wishlist items yet
              </Text>
            </View>
          ) : null}

          {products.map((product) => (
            <WishlistItem
              key={product._id}
              id={product._id}
              name={product.name}
              image={product.image}
              price={product.price}
              addingToCart={pendingCartId === product._id}
              removing={pendingRemoveId === product._id}
              onRemove={removeFromWishlist}
              onAddToCart={addToCart}
            />
          ))}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
