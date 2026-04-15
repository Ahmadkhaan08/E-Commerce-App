import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type MobileFooterProps = {
  onPressAbout: () => void;
  onPressContact: () => void;
  onPressTerms: () => void;
  onPressPrivacy: () => void;
};

export default function MobileFooter({
  onPressAbout,
  onPressContact,
  onPressTerms,
  onPressPrivacy,
}: MobileFooterProps) {
  return (
    <View className="mb-4 mt-6 rounded-3xl border border-[#dfe8ff] bg-white p-4">
      {/* Branding */}
      <View className="items-center">
        <Text className="text-xl font-bold text-[#203051]">BabyMart</Text>
        <Text className="mt-1 text-center text-sm text-[#6a789d]">
          Trusted essentials for moms and babies,{"\n"}delivered with care.
        </Text>
      </View>

      {/* Divider */}
      <View className="my-4 h-px bg-[#e4ecff]" />

      {/* Quick Links */}
      <View className="flex-row flex-wrap justify-center gap-x-5 gap-y-3">
        <Pressable onPress={onPressAbout} className="flex-row items-center gap-1.5">
          <Feather name="info" size={13} color="#5469cf" />
          <Text className="text-sm font-semibold text-[#5469cf]">About Us</Text>
        </Pressable>
        <Pressable onPress={onPressContact} className="flex-row items-center gap-1.5">
          <Feather name="mail" size={13} color="#5469cf" />
          <Text className="text-sm font-semibold text-[#5469cf]">Contact</Text>
        </Pressable>
        <Pressable onPress={onPressTerms} className="flex-row items-center gap-1.5">
          <Feather name="file-text" size={13} color="#5469cf" />
          <Text className="text-sm font-semibold text-[#5469cf]">Terms</Text>
        </Pressable>
        <Pressable onPress={onPressPrivacy} className="flex-row items-center gap-1.5">
          <Feather name="shield" size={13} color="#5469cf" />
          <Text className="text-sm font-semibold text-[#5469cf]">Privacy</Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View className="my-4 h-px bg-[#e4ecff]" />

      {/* Social Icons */}
      <View className="flex-row items-center justify-center gap-3">
        <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-[#edf2ff]">
          <Feather name="facebook" size={16} color="#4d62cb" />
        </Pressable>
        <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-[#edf2ff]">
          <Feather name="instagram" size={16} color="#4d62cb" />
        </Pressable>
        <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-[#edf2ff]">
          <Feather name="twitter" size={16} color="#4d62cb" />
        </Pressable>
      </View>

      {/* Copyright */}
      <Text className="mt-4 text-center text-[10px] text-[#9aa8c7]">
        © 2026 BabyMart. All rights reserved.
      </Text>
    </View>
  );
}
