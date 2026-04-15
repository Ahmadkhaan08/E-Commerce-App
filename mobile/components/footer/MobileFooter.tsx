import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type MobileFooterProps = {
  onPressAbout: () => void;
  onPressContact: () => void;
  onPressTerms: () => void;
};

export default function MobileFooter({
  onPressAbout,
  onPressContact,
  onPressTerms,
}: MobileFooterProps) {
  return (
    <View className="mb-4 mt-6 rounded-3xl border border-[#dfe8ff] bg-white p-4">
      <Text className="text-lg font-bold text-[#203051]">BabyMart</Text>
      <Text className="mt-1 text-sm text-[#6a789d]">
        Trusted essentials for moms and babies, delivered with care.
      </Text>

      <View className="mt-4 flex-row items-center justify-between">
        <Pressable onPress={onPressAbout}>
          <Text className="text-sm font-semibold text-[#5469cf]">About</Text>
        </Pressable>
        <Pressable onPress={onPressContact}>
          <Text className="text-sm font-semibold text-[#5469cf]">Contact</Text>
        </Pressable>
        <Pressable onPress={onPressTerms}>
          <Text className="text-sm font-semibold text-[#5469cf]">Terms</Text>
        </Pressable>
      </View>
      <View className="mt-4 flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#edf2ff]">
          <Feather name="facebook" size={15} color="#4d62cb" />
        </View>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#edf2ff]">
          <Feather name="instagram" size={15} color="#4d62cb" />
        </View>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#edf2ff]">
          <Feather name="twitter" size={15} color="#4d62cb" />
        </View>
      </View>
    </View>
  );
}
