import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type FloatingCartProps = {
  cartCount: number;
  onPress: () => void;
};

export default function FloatingCart({ cartCount, onPress }: FloatingCartProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-[74px] right-5 h-12 w-12 items-center justify-center rounded-full border border-[#9cdbf7] bg-[#c9f0ff]"
      style={{
        shadowColor: "#89cce8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 7,
        elevation: 5,
      }}
    >
      <Feather name="shopping-cart" size={18} color="#1f2a44" />
      {cartCount > 0 ? (
        <View className="absolute -right-1 -top-1 min-h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#ff6f90] px-[2px]">
          <Text className="text-[9px] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
