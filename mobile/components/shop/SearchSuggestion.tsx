import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type SearchSuggestionProps = {
  icon: "clock" | "trending-up" | "tag";
  label: string;
  onPress: () => void;
};

export default function SearchSuggestion({ icon, label, onPress }: SearchSuggestionProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center rounded-xl bg-white p-3 shadow-sm">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-[#eef3ff]">
        <Feather name={icon} size={14} color="#6277e2" />
      </View>
      <Text className="ml-2 flex-1 text-sm text-gray-700" numberOfLines={1}>
        {label}
      </Text>
      <Feather name="arrow-up-right" size={14} color="#9aa9d8" />
    </Pressable>
  );
}
