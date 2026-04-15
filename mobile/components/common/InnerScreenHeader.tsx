import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type InnerScreenHeaderProps = {
  title: string;
  rightAction?: ReactNode;
  href?:string
};

export default function InnerScreenHeader({
  title,
  rightAction,
}: InnerScreenHeaderProps) {
  return (
    <View className="h-14 flex-row items-center justify-between border-b border-[#dbe6ff] bg-white px-4">
      <Pressable
        onPress={() => router.back()}
        className="h-12 w-12 items-center justify-center rounded-full bg-[#eef3ff]"
      >
        <Feather name="arrow-left" size={20} color="#2f3b59" />
      </Pressable>
      <Text className="text-2xl font-bold text-[#1f2a44]">{title}</Text>
      {rightAction ?? <View className="h-12 w-12" />}
    </View>
  );
}
