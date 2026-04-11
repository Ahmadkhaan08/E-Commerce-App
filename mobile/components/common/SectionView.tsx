import React from "react";
import { Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
// import { ChevronRight } from "lucide-react-native"; // ⚠️ use this, not lucide-react
import AntDesign from "@expo/vector-icons/AntDesign";
interface Props {
  title: string;
  href: string;
  hrefTitle: string;
}

const SectionView = ({ title, href, hrefTitle }: Props) => {
  return (
    <View className="flex-row items-center justify-between px-3 py-2">
      {/* Title */}
      <Text className="text-2xl font-semibold">{title}</Text>

      {/* Link */}
      <Link href={href as any} asChild>
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-md font-medium text-babyshopSky ">
              {hrefTitle}
            </Text>
            <Text className="text-babyshopSky mt-1.5">
              <AntDesign name="right" size={14} />
            </Text>
          </View>
        </Pressable>
      </Link>
    </View>
  );
};

export default SectionView;
