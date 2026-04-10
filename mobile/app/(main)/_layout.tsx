import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { Slot } from "expo-router";
import { ScrollView, View } from "react-native";

export default function MainLayout() {
  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <Header />
      <View>
        <Slot />
      </View>
      <Footer/>
    </ScrollView>
  );
}
