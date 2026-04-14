import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type PaymentOptionProps = {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
};

export default function PaymentOption({ label, description, selected, onPress }: PaymentOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between rounded-2xl border p-3 ${selected ? "border-[#aab9ff] bg-[#eef2ff]" : "border-[#e2eaff] bg-white"}`}
    >
      <View className="flex-1 pr-2">
        <Text className="text-sm font-semibold text-gray-800">{label}</Text>
        {description ? <Text className="mt-1 text-xs text-gray-500">{description}</Text> : null}
      </View>

      <View
        className={`h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-[#6579e8] bg-[#6579e8]" : "border-[#cfd9f8] bg-white"}`}
      >
        {selected ? <Feather name="check" size={12} color="#ffffff" /> : null}
      </View>
    </Pressable>
  );
}
