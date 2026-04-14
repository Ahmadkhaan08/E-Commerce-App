import { logo } from "@/assets/image";
import { getAuthToken, searchProducts } from "@/constants/mobileApi";
import { Product } from "@/types/type";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type HeaderProps = {
  cartCount: number;
  logoUri?: string;
};

export default function Header({ cartCount, logoUri }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: liveResults = [] } = useQuery({
    queryKey: ["header-search", debouncedQuery],
    queryFn: async () => searchProducts<Product>(debouncedQuery),
    enabled: debouncedQuery.length > 1,
    staleTime: 30000,
  });

  const submitSearch = () => {
    const term = query.trim();
    if (!term) {
      router.push("/(main)/search");
      return;
    }

    router.push({ pathname: "/(main)/search-results", params: { q: term } });
  };

  return (
    <View className="border-b mt-12 border-[#dbe7ff] bg-white px-4 pb-3 pt-3">
      <View className="flex-row items-center justify-between">

        <Pressable onPress={() => router.push("/")} className="items-center">
          <Image
            source={logoUri ? { uri: logoUri } : logo}
            style={{ width: 126, height: 42 }}
            contentFit="contain"
          />
        </Pressable>
        <View className="w-[92px] flex-row items-center gap-2">
          <Pressable onPress={() => router.push("/(main)/wishlist")} className="h-9 w-9 items-center justify-center rounded-full bg-[#eff4ff]">
            <Feather name="heart" size={18} color="#5f74d8" />
          </Pressable>

          <Pressable onPress={() => router.push("/(main)/cart")} className="relative h-9 w-9 items-center justify-center rounded-full bg-[#eff4ff]">
            <Ionicons name="cart-outline" size={18} color="#5f74d8" />
            {cartCount > 0 ? (
              <View className="absolute  min-h-[16px] min-w-[16px] items-right center rounded-full bg-[#ff6d8e] px-[2px]">
                <Text className="text-[9px] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

      </View>

      <View className="mt-3 rounded-2xl border flex border-[#dbe6ff] bg-[#f8fbff] px-3 py-2">
        <View className="flex-row items-center justify-center">
          <Feather name="search" size={16} color="#6f81b5" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            placeholder="Search baby products, diapers, toys..."
            placeholderTextColor="#8c99b8"
            className="ml-2 flex-1 text-base font-medium text-[#1f2a44]"
            returnKeyType="search"
          />
          <Pressable onPress={submitSearch} className="rounded-full bg-[#6b80ea] px-3 py-1">
            <Text className="text-xs font-bold text-white">Search</Text>
          </Pressable>
        </View>

        {debouncedQuery.length > 1 ? (
          <Text className="mt-2 text-xs text-[#6879a6]">{liveResults.length} matching items found</Text>
        ) : null}
      </View>
    </View>
  );
}
