import ProductCard from "@/components/shop/ProductCard";
import SearchSuggestion from "@/components/shop/SearchSuggestion";
import { apiRequest, searchProducts } from "@/constants/mobileApi";
import { Brand, Category, Product } from "@/types/type";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type ProductResponse = {
  products: Product[];
};

type CategoryResponse = {
  category: Category[];
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsData, categoryData, brandData] = await Promise.all([
          apiRequest<ProductResponse>("/api/products?limit=12&sortOrder=desc"),
          apiRequest<CategoryResponse>("/api/categories?perPage=10"),
          apiRequest<Brand[]>("/api/brands"),
        ]);

        const products = Array.isArray(productsData.products) ? productsData.products : [];
        const categories = Array.isArray(categoryData.category) ? categoryData.category : [];
        const brands = Array.isArray(brandData) ? brandData : [];

        setPopularProducts(products.slice(0, 8));
        setBrands(brands.slice(0, 8));

        const fromCategories = categories.slice(0, 4).map((item) => item.name);
        const fromBrands = brands.slice(0, 4).map((item) => item.name);
        setPopularSearches([...fromCategories, ...fromBrands]);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load search data");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      const result = await searchProducts<Product>(debouncedQuery);
      return result.slice(0, 6);
    },
    enabled: debouncedQuery.length > 1,
    staleTime: 30000,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const productsData = await apiRequest<ProductResponse>("/api/products?limit=12&sortOrder=desc");
      setPopularProducts(Array.isArray(productsData.products) ? productsData.products.slice(0, 8) : []);
    } finally {
      setRefreshing(false);
    }
  };

  const activeSuggestions = useMemo(() => {
    if (!debouncedQuery) {
      return [];
    }

    return suggestions.slice(0, 5);
  }, [debouncedQuery, suggestions]);

  const submitSearch = (value: string) => {
    const term = value.trim();
    if (!term) {
      return;
    }

    setRecent((prev) => [term, ...prev.filter((item) => item !== term)].slice(0, 5));
    router.push({ pathname: "/(main)/search-results", params: { q: term } });
  };

  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="border-b border-[#dbe6ff] bg-white px-4 pb-3 pt-4">
        <View className="flex-row items-center rounded-full bg-[#f2f6ff] px-3 py-2">
          <Feather name="search" size={15} color="#7386b5" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => submitSearch(query)}
            placeholder="Search baby products"
            className="ml-2 flex-1 text-sm text-gray-800"
          />
          <Pressable onPress={() => submitSearch(query)} className="rounded-full bg-[#7d8ff6] px-3 py-1">
            <Text className="text-xs font-semibold text-white">Go</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7d8ff6" />}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 20 }}
      >
        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#7d8ff6" />
          </View>
        ) : null}

        {error ? (
          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-sm text-gray-500">{error}</Text>
          </View>
        ) : null}

        {!loading ? (
          <>
            {activeSuggestions.length > 0 ? (
              <View>
                <Text className="mb-2 text-sm font-bold text-gray-800">Suggestions</Text>
                <View className="gap-2">
                  {activeSuggestions.map((item) => (
                    <SearchSuggestion key={item._id} icon="trending-up" label={item.name} onPress={() => submitSearch(item.name)} />
                  ))}
                </View>
              </View>
            ) : null}

            <View className="mt-4">
              <Text className="mb-2 text-sm font-bold text-gray-800">Recent Searches</Text>
              <View className="gap-2">
                {recent.length > 0 ? (
                  recent.map((item) => (
                    <SearchSuggestion key={item} icon="clock" label={item} onPress={() => submitSearch(item)} />
                  ))
                ) : (
                  <View className="rounded-2xl bg-white p-4 shadow-sm">
                    <Text className="text-sm text-gray-500">No recent searches</Text>
                  </View>
                )}
              </View>
            </View>

            <View className="mt-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-gray-800">Popular Now</Text>
                <Pressable onPress={() => router.push({ pathname: "/(main)/search-results", params: { q: "" } })}>
                  <Text className="text-xs font-semibold text-[#4256ad]">See All</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {popularProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    layout="horizontal"
                    onPress={() => router.push({ pathname: "/(main)/product/[id]", params: { id: product._id } })}
                  />
                ))}
              </ScrollView>
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-sm font-bold text-gray-800">Shop by Brand</Text>
              <View className="flex-row flex-wrap gap-2">
                {brands.map((item) => (
                  <Pressable
                    key={item._id}
                    onPress={() =>
                      router.push({
                        pathname: "/(main)/products",
                        params: { brand: item._id, title: item.name },
                      })
                    }
                    className="rounded-full bg-white px-3 py-2 shadow-sm"
                  >
                    <Text className="text-xs font-semibold text-gray-700">{item.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-sm font-bold text-gray-800">Popular Searches</Text>
              <View className="gap-2">
                {popularSearches.map((item) => (
                  <SearchSuggestion key={item} icon="tag" label={item} onPress={() => submitSearch(item)} />
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
