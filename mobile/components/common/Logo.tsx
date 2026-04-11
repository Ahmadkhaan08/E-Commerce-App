import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { logo, smallLogo } from "@/assets/image";
import { Link } from "expo-router";

const Logo = () => {
  return (
    <Link href={"/"} asChild className="flex-row items-center justify-center gap-2">
      <Pressable>
        <Image source={smallLogo} className="w-10 h-10  " />
        <Text className="font-extrabold text-xl">BabyMart</Text>
      </Pressable>
    </Link>
  );
};

export default Logo;
