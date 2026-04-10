import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { logo, smallLogo } from "@/assets/image";
import { Link } from "expo-router";

const Logo = () => {
  return (
    <Link href={"/"} asChild>
      <Pressable>
        <Image source={smallLogo} className="w-10 h-10 rounded-lg " />
      </Pressable>
    </Link>
  );
};

export default Logo;
