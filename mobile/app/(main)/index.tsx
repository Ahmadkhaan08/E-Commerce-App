import BabyTravelSection from "@/components/home/BabyTravelSection";
import Banner from "@/components/home/Banner";
import HomeBrand from "@/components/home/HomeBrand";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function Index() {
  
  return (
    
<ScrollView className="px-4 py-3">
  <Banner/>
  <HomeBrand/>
  <BabyTravelSection/>
</ScrollView>
  );
}
