import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Banners } from "@/types/type";
import { Link } from "expo-router";
import { getBaseUrl } from "@/constants/api";


const Banner = () => {
  const [banners, setBanners] = useState<Banners[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = useMemo(() => getBaseUrl(), []);

  useEffect(() => {
    let mounted = true;

    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiBaseUrl}/api/banners`);
        if (!response.ok) {
          throw new Error(`Failed to fetch banners (${response.status})`);
        }

        const data = (await response.json()) as Banners[];
        if (mounted) {
          setBanners(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (mounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to fetch banners",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchBanners();

    return () => {
      mounted = false;
    };
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-4 py-6">
        <Text className="text-red-600">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="ml-2">
      {banners.map((banner) => (
        <View key={banner._id} className="mr-3">
          {banner.image ? (
            <View className="relative  ">
              <Image
                source={{ uri: banner.image }}
                className="h-80 w-100 rounded-md bg-gray-100 mt-3"
                resizeMode="cover"
              />
              <View className="absolute top-0 left-0  h-full w-full  items-center justify-center gap-3">
                <Text className="font-bold text-lg text-black">
                  {banner.name}
                </Text>
                <Text className="font-medium text-4xl text-black max-w-96 text-center capitalize ">
                  {banner.title}
                </Text>
                <Link href={"/"} asChild>
                  <Pressable>
                    <Text className="bg-babyshopWhite rounded-full font-medium text-babyshopBlack px-6 py-2 text-base">
                      Shop Now
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          ) : (
            <View className="h-40 w-full items-center justify-center rounded-xl bg-gray-100">
              <Text>{banner.title || banner.name}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default Banner;
