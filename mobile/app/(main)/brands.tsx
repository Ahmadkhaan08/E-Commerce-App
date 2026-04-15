import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import SkeletonBox from "@/skeleton/SkeletonBox";
import { getBaseUrl } from "@/constants/api";
import { Brand } from "@/types/type";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";

export default function BrandsScreen() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${getBaseUrl()}/api/brands`);
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = (await response.json()) as Brand[];
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load brands");
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadBrands();
      setLoading(false);
    };
    run();
  }, [loadBrands]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBrands();
    setRefreshing(false);
  }, [loadBrands]);

  const navigateToBrand = (brand: Brand) => {
    router.push({
      pathname: "/(main)/products" as any,
      params: { brand: brand._id, title: brand.name },
    });
  };

  const renderSkeleton = () => (
    <View className="flex-row flex-wrap justify-between gap-y-3 px-4 pt-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <View
          key={i}
          className="items-center rounded-2xl border border-[#e2eaff] bg-white p-3"
          style={{ width: "31%" }}
        >
          <SkeletonBox width={64} height={64} borderRadius={32} />
          <SkeletonBox
            width={60}
            height={10}
            borderRadius={6}
            style={{ marginTop: 8 }}
          />
        </View>
      ))}
    </View>
  );

  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Brands" />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7f8ff5"
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {loading ? renderSkeleton() : null}

        {error && !loading ? (
          <View className="mx-4 mt-4 rounded-2xl border border-[#dce7ff] bg-white p-4">
            <Text className="text-sm text-[#6e7a97]">{error}</Text>
          </View>
        ) : null}

        {!loading && brands.length === 0 && !error ? (
          <View className="mx-4 mt-16 items-center rounded-2xl border border-[#dce7ff] bg-white p-6">
            <Text className="text-sm text-[#6e7a97]">No brands available</Text>
          </View>
        ) : null}

        {!loading && brands.length > 0 ? (
          <View className="flex-row flex-wrap justify-between gap-y-3 px-4 pt-4">
            {brands.map((brand) => (
              <Pressable
                key={brand._id}
                onPress={() => navigateToBrand(brand)}
                className="items-center rounded-2xl border border-[#dde6ff] bg-white p-3"
                style={{
                  width: "31%",
                  shadowColor: "#becbf0",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#eaf1ff]">
                  {brand.image ? (
                    <Image
                      source={{ uri: brand.image }}
                      contentFit="cover"
                      style={{ height: "100%", width: "100%" }}
                    />
                  ) : (
                    <Text className="text-base font-bold text-[#5f71d9]">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text
                  className="mt-2 px-1 text-center text-xs font-semibold text-[#1f2a44]"
                  numberOfLines={1}
                >
                  {brand.name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
}
