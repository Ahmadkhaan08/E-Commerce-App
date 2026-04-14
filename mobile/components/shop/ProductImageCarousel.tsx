import React, { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type ProductImageCarouselProps = {
  images: string[];
};

export default function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(250, width - 32);
  const [activeIndex, setActiveIndex] = useState(0);

  const validImages = images.filter(Boolean);

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const x = event.nativeEvent.contentOffset.x;
          const index = Math.round(x / cardWidth);
          setActiveIndex(index);
        }}
      >
        {(validImages.length > 0 ? validImages : [""]).map((uri, index) => (
          <View key={`${uri}-${index}`} style={{ width: cardWidth }} className="h-64 overflow-hidden rounded-3xl bg-[#edf4ff]">
            {uri ? (
              <Image source={{ uri }} contentFit="cover" style={{ width: "100%", height: "100%" }} />
            ) : (
              <LinearGradient colors={["#edf4ff", "#dbe8ff"]} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <MaterialCommunityIcons name="baby-carriage" size={38} color="#6678ef" />
              </LinearGradient>
            )}
          </View>
        ))}
      </ScrollView>

      <View className="mt-3 flex-row items-center justify-center gap-1">
        {(validImages.length > 0 ? validImages : [""]).map((_, index) => (
          <View
            key={`dot-${index}`}
            className={`h-[6px] rounded-full ${activeIndex === index ? "w-5 bg-[#6678ef]" : "w-[6px] bg-[#c7d3f5]"}`}
          />
        ))}
      </View>
    </View>
  );
}
