import React from "react";
import { Pressable, Text, View } from "react-native";

type FilterOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function FilterOption({ label, selected, onPress }: FilterOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${selected ? "border-[#95a7ff] bg-[#e9eeff]" : "border-[#d9e3ff] bg-white"}`}
    >
      <View className="flex-row items-center">
        <Text className={`text-xs font-semibold ${selected ? "text-[#3f54ac]" : "text-gray-600"}`}>{label}</Text>
      </View>
    </Pressable>
  );
}
