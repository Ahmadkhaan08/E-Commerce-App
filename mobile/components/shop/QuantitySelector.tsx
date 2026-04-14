import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type QuantitySelectorProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function QuantitySelector({ quantity, onDecrease, onIncrease }: QuantitySelectorProps) {
  return (
    <View className="flex-row items-center gap-2">
      <Pressable onPress={onDecrease} className="h-8 w-8 items-center justify-center rounded-full border border-[#d9e4ff] bg-white">
        <Feather name="minus" size={14} color="#1f2a44" />
      </Pressable>
      <Text className="w-6 text-center text-base font-bold text-[#1f2a44]">{quantity}</Text>
      <Pressable onPress={onIncrease} className="h-8 w-8 items-center justify-center rounded-full border border-[#d9e4ff] bg-white">
        <Feather name="plus" size={14} color="#1f2a44" />
      </Pressable>
    </View>
  );
}
