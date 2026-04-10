import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { Slot } from "expo-router";
import { View } from "react-native";

export default function MainLayout() {
  return (
    <View>
      <Header />
      <View>
        <Slot />
      </View>
      <Footer/>
    </View>
  );
}
