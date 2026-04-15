import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

type ScreenWrapperProps = {
  children: ReactNode;
  edges?: Edge[];
  bg?: string;
};

export default function ScreenWrapper({
  children,
  edges = ["top"],
  bg = "#edf3ff",
}: ScreenWrapperProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={edges}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
