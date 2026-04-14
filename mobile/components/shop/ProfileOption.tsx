import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type ProfileOptionProps = {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  onPress: () => void;
};

export default function ProfileOption({ label, icon, onPress }: ProfileOptionProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between border-b border-[#edf2ff] px-4 py-3">
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#eaf1ff]">
          <Feather name={icon} size={16} color="#6678ef" />
        </View>
        <Text className="text-sm font-semibold text-[#1f2a44]">{label}</Text>
      </View>
      <Feather name="chevron-right" size={16} color="#7d89aa" />
    </Pressable>
  );
}
