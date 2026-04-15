import CartItem from "@/components/shop/CartItem";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import SkeletonBox from "@/skeleton/SkeletonBox";
import { apiRequest, getAuthToken } from "@/constants/mobileApi";
import { useStore } from "@/store/useStore";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";

type CartLine = {
  productId: {
    _id: string;
    name: string;
    image?: string;
    price: number;
    discountPercentage?: number;
  };
  quantity: number;
};

type CartResponse = {
  success: boolean;
  cart: CartLine[];
};

const toPrice = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;

function CartSkeleton() {
  return (
    <View>
      {Array.from({ length: 3 }).map((_, i) => (
        <View
          key={i}
          className="mb-3 flex-row rounded-2xl border border-[#dde6ff] bg-white p-3"
        >
          <SkeletonBox width={64} height={64} borderRadius={12} />
          <View className="ml-3 flex-1">
            <SkeletonBox width="80%" height={14} borderRadius={6} />
            <SkeletonBox width="40%" height={14} borderRadius={6} style={{ marginTop: 6 }} />
            <View className="mt-3 flex-row items-center justify-between">
              <SkeletonBox width={90} height={28} borderRadius={8} />
              <SkeletonBox width={32} height={32} borderRadius={16} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const refreshCounts = useStore((s) => s.refreshCounts);
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthReady(true);
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      setError(null);
      const data = await apiRequest<CartResponse>("/api/carts", undefined, token);
      setItems(Array.isArray(data.cart) ? data.cart : []);
      await refreshCounts();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load cart");
    }
  }, [refreshCounts]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    const run = async () => {
      setLoading(true);
      await loadCart();
      setLoading(false);
    };

    run();
  }, [authReady, loadCart]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  }, [loadCart]);

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      setPendingItemId(productId);
      await apiRequest<CartResponse>(
        "/api/carts/update",
        {
          method: "PUT",
          body: JSON.stringify({ productId, quantity }),
        },
        token,
      );

      await loadCart();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update cart");
    } finally {
      setPendingItemId(null);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      setPendingItemId(productId);
      await apiRequest<CartResponse>(`/api/carts/${productId}`, { method: "DELETE" }, token);
      await loadCart();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to remove item");
    } finally {
      setPendingItemId(null);
    }
  };

  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + line.productId.price * line.quantity, 0),
    [items],
  );

  const discount = useMemo(
    () =>
      items.reduce(
        (sum, line) => sum + Math.round((line.productId.price * (line.productId.discountPercentage ?? 0) * line.quantity) / 100),
        0,
      ),
    [items],
  );

  const total = Math.max(subtotal - discount, 0);

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
      <InnerScreenHeader title="Cart" />
   

        <ScrollView
          className="flex-1 px-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7f8ff5" />}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 130 }}
        >
          {loading ? <CartSkeleton /> : null}

          {error ? (
            <View className="mb-4 rounded-2xl border border-[#dce7ff] bg-white p-3">
              <Text className="text-xs text-[#6e7a97]">{error}</Text>
            </View>
          ) : null}

          {!loading && items.length === 0 ? (
            <View className="mt-16 items-center rounded-2xl border border-[#dce7ff] bg-white p-6">
              <Text className="text-sm text-[#6e7a97]">Your cart is empty</Text>
            </View>
          ) : null}

          {items.map((line) => (
            <CartItem
              key={line.productId._id}
              product={line.productId}
              quantity={line.quantity}
              loading={pendingItemId === line.productId._id}
              onIncrease={() => updateQuantity(line.productId._id, line.quantity + 1)}
              onDecrease={() => updateQuantity(line.productId._id, Math.max(0, line.quantity - 1))}
              onRemove={() => removeItem(line.productId._id)}
            />
          ))}

          {items.length > 0 ? (
            <View className="rounded-2xl border border-[#dde6ff] bg-white p-4">
              <Text className="mb-2 text-sm font-bold text-[#1f2a44]">Price Summary</Text>
              <View className="mb-1 flex-row justify-between">
                <Text className="text-sm text-[#6e7a97]">Subtotal</Text>
                <Text className="text-sm font-semibold text-[#1f2a44]">{toPrice(subtotal)}</Text>
              </View>
              <View className="mb-1 flex-row justify-between">
                <Text className="text-sm text-[#6e7a97]">Discount</Text>
                <Text className="text-sm font-semibold text-[#1f2a44]">{toPrice(discount)}</Text>
              </View>
              <View className="mt-1 flex-row justify-between border-t border-[#e2e9ff] pt-2">
                <Text className="text-base font-bold text-[#1f2a44]">Total</Text>
                <Text className="text-base font-extrabold text-[#1d3257]">{toPrice(total)}</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 border-t border-[#dce7ff] bg-white px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <Pressable onPress={() => router.push("/(main)/checkout")} className="items-center justify-center rounded-2xl bg-[#7f8ff5] py-3">
            <Text className="text-base font-bold text-white">Checkout</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}
