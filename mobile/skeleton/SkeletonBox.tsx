import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

type SkeletonBoxProps = {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export default function SkeletonBox({
  width,
  height,
  borderRadius = 12,
  style,
}: SkeletonBoxProps) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#d4ddf5",
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}
