import FilterOption from "@/components/shop/FilterOption";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { apiRequest } from "@/constants/mobileApi";
import { Brand, Category } from "@/types/type";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sortOptions = [
  { label: "Most Popular", value: "desc" },
  { label: "Price: Low → High", value: "asc" },
  { label: "Price: High → Low", value: "desc-price" },
  { label: "Top Rated", value: "top-rated" },
];

const discountOptions = ["10%+", "20%+", "30%+"];

type CategoryResponse = { category: Category[] };

export default function FiltersScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sort, setSort] = useState("desc");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [discount, setDiscount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [categoryData, brandData] = await Promise.all([
          apiRequest<CategoryResponse>("/api/categories?perPage=30"),
          apiRequest<Brand[]>("/api/brands"),
        ]);

        setCategories(Array.isArray(categoryData.category) ? categoryData.category : []);
        setBrands(Array.isArray(brandData) ? brandData : []);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const clearAll = () => {
    setSort("desc");
    setCategory("");
    setBrand("");
    setDiscount("");
  };

  const viewResults = () => {
    router.push({
      pathname: "/(main)/search-results",
      params: {
        q: params.q || "",
        category,
        brand,
        sort,
        discount,
      },
    });
  };

  return (
    <ScreenWrapper>
      <View className="h-14 flex-row items-center justify-between border-b border-[#dbe6ff] bg-white px-4">
        <Pressable onPress={() => router.back()} className="h-8 w-8 items-center justify-center rounded-full bg-[#eef3ff]">
          <Feather name="arrow-left" size={16} color="#2f3b59" />
        </Pressable>
        <Text className="text-base font-bold text-gray-800">Filters & Sort</Text>
        <Pressable onPress={clearAll} className="rounded-full bg-[#ecf1ff] px-3 py-1">
          <Text className="text-xs font-semibold text-[#465ab6]">Clear All</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 14, paddingBottom: 100 }}>
        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#7d8ff6" />
          </View>
        ) : (
          <>
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <Text className="text-sm font-bold text-gray-800">Sort Options</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <FilterOption key={option.label} label={option.label} selected={sort === option.value} onPress={() => setSort(option.value)} />
                ))}
              </View>
            </View>

            <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
              <Text className="text-sm font-bold text-gray-800">Categories</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {categories.map((item) => (
                  <FilterOption key={item._id} label={item.name} selected={category === item._id} onPress={() => setCategory(item._id)} />
                ))}
              </View>
            </View>

            <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
              <Text className="text-sm font-bold text-gray-800">Brands</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {brands.map((item) => (
                  <FilterOption key={item._id} label={item.name} selected={brand === item._id} onPress={() => setBrand(item._id)} />
                ))}
              </View>
            </View>

            <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
              <Text className="text-sm font-bold text-gray-800">Discount</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {discountOptions.map((item) => (
                  <FilterOption key={item} label={item} selected={discount === item} onPress={() => setDiscount(item)} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#dbe6ff] bg-white px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Pressable onPress={viewResults} className="flex-row items-center justify-center rounded-2xl bg-[#7d8ff6] py-3">
          <Text className="text-sm font-bold text-white">View Results</Text>
          <Feather name="arrow-right" size={14} color="#fff" style={{ marginLeft: 6 }} />
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
