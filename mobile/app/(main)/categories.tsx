import CategoryCard from "@/components/shop/CategoryCard";
import { apiRequest } from "@/constants/mobileApi";
import { Category } from "@/types/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

type CategoryResponse = {
  category: Category[];
};

type TabType = "For Mom" | "For Baby" | "On Sale";

export default function CategoriesScreen() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("For Baby");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setError(null);
      const data = await apiRequest<CategoryResponse>("/api/categories?perPage=50");
      setCategories(Array.isArray(data.category) ? data.category : []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load categories");
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadCategories();
      setLoading(false);
    };

    run();
  }, [loadCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    let list = categories;

    if (activeTab === "For Mom") {
      list = categories.filter((item) => item.name.toLowerCase().includes("mom"));
    }

    if (activeTab === "On Sale") {
      list = categories.filter(
        (item) => item.name.toLowerCase().includes("sale") || item.categoryType.toLowerCase().includes("hot"),
      );
    }

    if (!search.trim()) {
      return list;
    }

    const needle = search.toLowerCase();
    return list.filter((item) => item.name.toLowerCase().includes(needle));
  }, [activeTab, categories, search]);

  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="h-14 flex-row items-center justify-between border-b border-[#e1e9ff] bg-white px-4">
        <Pressable onPress={() => router.back()} className="h-8 w-8 items-center justify-center rounded-full bg-[#f1f5ff]">
          <Feather name="arrow-left" size={16} color="#1f2a44" />
        </Pressable>
        <Text className="text-base font-bold text-[#1f2a44]">Categories</Text>
        <View className="h-8 w-8" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7f8ff5" />}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 20 }}
      >
        <View className="h-10 flex-row items-center rounded-full border border-[#dbe6ff] bg-white px-3">
          <Feather name="search" size={15} color="#8693b3" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search categories"
            placeholderTextColor="#8693b3"
            className="ml-2 flex-1 text-[13px] text-[#1f2a44]"
          />
        </View>

        <View className="mt-3 flex-row gap-2">
          {(["For Mom", "For Baby", "On Sale"] as TabType[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 ${activeTab === tab ? "bg-[#7f8ff5]" : "bg-white"}`}
            >
              <Text className={`text-xs font-semibold ${activeTab === tab ? "text-white" : "text-[#6e7a97]"}`}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#7f8ff5" />
          </View>
        ) : null}

        {error ? (
          <View className="mt-4 rounded-2xl border border-[#dce7ff] bg-white p-3">
            <Text className="text-xs text-[#6e7a97]">{error}</Text>
          </View>
        ) : null}

        {!loading ? (
          <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <View key={category._id} style={{ width: "31%" }}>
                  <CategoryCard
                    name={category.name}
                    image={category.image}
                    onPress={() =>
                      router.push({
                        pathname: "/(main)/products",
                        params: { category: category._id, title: category.name },
                      })
                    }
                  />
                </View>
              ))
            ) : (
              <View className="w-full items-center rounded-2xl border border-[#dce7ff] bg-white p-5">
                <Text className="text-sm text-[#6e7a97]">No categories found</Text>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
