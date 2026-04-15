import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Category } from "@/types/type";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";

type CategoryListProps = {
  categories: Category[];
  onSeeAll: () => void;
};

function CategoryIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();

  if (lower.includes("diaper")) return <MaterialCommunityIcons name="baby-face-outline" size={16} color="#6777e8" />;
  if (lower.includes("toy")) return <MaterialCommunityIcons name="teddy-bear" size={16} color="#6777e8" />;
  if (lower.includes("cloth")) return <Ionicons name="shirt-outline" size={16} color="#6777e8" />;
  if (lower.includes("feed")) return <MaterialCommunityIcons name="baby-bottle-outline" size={16} color="#6777e8" />;
  return <Feather name="grid" size={15} color="#6777e8" />;
}

export default function CategoryList({ categories, onSeeAll }: CategoryListProps) {
  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-[#1f2a44]">Categories</Text>
        <Pressable onPress={onSeeAll}>
          <Text className="text-sm font-semibold mr-2 text-[#7382a8]">See All</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {(categories.length > 0 ? categories : []).map((category) => (
          <Pressable key={category._id} className="w-[72px] items-center">
            <View
              className="h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border border-[#dbe6ff] bg-white"
              style={{
                shadowColor: "#bac7eb",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              {category.image ? (
                <Image source={{ uri: category.image }} contentFit="cover" style={{ height: "80%", width: "80%" }} />
              ) : (
                <CategoryIcon name={category.name} />
              )}
            </View>
            <Text className="mt-1 text-center text-[10px] font-semibold text-[#1f2a44]" numberOfLines={2}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
