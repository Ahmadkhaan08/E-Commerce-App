import { View, Text, ScrollView, Image, Pressable } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Brand } from "@/types/type";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getBaseUrl } from "@/constants/api";
import SectionView from "../common/SectionView";
import { Link } from "expo-router";

const HomeBrand = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = useMemo(() => getBaseUrl(), []);

  useEffect(() => {
    const controller = new AbortController();
    const getBrands = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/brands`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch brands (${response.status})`);
        }
        const data = (await response.json()) as Brand[];
        setBrands(Array.isArray(data) ? data : []);
      } catch (error: any) {
        if (error.name !== "AbortError") setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getBrands();
    return () => controller.abort();
  }, [apiBaseUrl]);
  if (brands.length === 0) return null;
  return (
    <ScrollView className="mt-5 bg-babyshopWhite p-3 rounded-md">
      <SectionView
        title="Brand we love"
        href="/shop"
        hrefTitle="View all brands"
      />
      <View className="flex-row  flex-wrap justify-between mt-4">
        {brands.map((brand) => (
          <View
          key={brand?._id}
          className="w-[48%] mb-4">
            <Link
              href={
                {
                  pathname: "/shop",
                  params: { brand: String(brand._id) },
                } as any
              } asChild
            >
                <Pressable className="items-center">

              <Image
                source={{ uri: brand?.image }}
                className="mt-2"
                height={130}
                width={130}
                />
              <Text className="mt-2 text-sm  font-medium text-center">{brand.name}</Text>
                </Pressable>
            </Link>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default HomeBrand;
