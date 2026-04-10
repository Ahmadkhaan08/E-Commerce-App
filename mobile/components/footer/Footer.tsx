import { View, Text, ScrollView, Pressable, Image } from "react-native";
import React from "react";
import TopFooter from "./TopFooter";
import HrLine from "../common/HrLine";
import { CustomerTab, informationTab, OthersTab } from "@/constants/data";
import { Link } from "expo-router";
import { payment } from "@/assets/image";

const Footer = () => {
  return (
    <ScrollView className="bg-babyshopWhite">
      <TopFooter />
      <HrLine />
      <View className="py-5 px-3  flex flex-col justify-between gap-2">
        <Text className="text-center text-gray-600 ">
          © 2026 BabyMart Theme. All rights reserved.
        </Text>
        <View className="flex-row  items-center  justify-center flex-wrap  gap-3">
          <Text className=" text-gray-700">We are using safe payment for</Text>
          <Image
            source={payment}
            className="h-8 w-[48%]"
            resizeMode="contain"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Footer;
