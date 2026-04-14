import React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type CategoryCardProps = {
  name: string;
  image?: string;
  onPress?: () => void;
};

function IconByName({ name }: { name: string }) {
  const lower = name.toLowerCase();

  if (lower.includes("diaper")) return <MaterialCommunityIcons name="baby-face-outline" size={18} color="#6678ef" />;
  if (lower.includes("toy")) return <MaterialCommunityIcons name="teddy-bear" size={18} color="#6678ef" />;
  if (lower.includes("cloth")) return <Ionicons name="shirt-outline" size={18} color="#6678ef" />;
  if (lower.includes("feed")) return <MaterialCommunityIcons name="baby-bottle-outline" size={18} color="#6678ef" />;
  return <Feather name="grid" size={16} color="#6678ef" />;
}

export default function CategoryCard({ name, image, onPress }: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center rounded-2xl border border-[#dde6ff] bg-white py-3"
      style={{
        shadowColor: "#bdcaf0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#eaf2ff]">
        {image ? <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : <IconByName name={name} />}
      </View>
      <Text className="mt-2 px-1 text-center text-xs font-semibold text-[#1f2a44]" numberOfLines={2}>{name}</Text>
    </Pressable>
  );
}
