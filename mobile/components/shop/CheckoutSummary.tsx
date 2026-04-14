import React, { useMemo } from "react";
import { Text, View } from "react-native";

type SummaryItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discountPercentage?: number;
};

type CheckoutSummaryProps = {
  items: SummaryItem[];
};

const toPrice = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;

export default function CheckoutSummary({ items }: CheckoutSummaryProps) {
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const discount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Math.round((item.price * (item.discountPercentage ?? 0) * item.quantity) / 100),
        0,
      ),
    [items],
  );

  const total = Math.max(subtotal - discount, 0);

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-base font-bold text-gray-800">Order Summary</Text>

      <View className="mt-3 gap-2">
        {items.map((item) => (
          <View key={item.id} className="flex-row items-center justify-between">
            <Text className="flex-1 pr-2 text-sm text-gray-600" numberOfLines={1}>
              {item.name} x{item.quantity}
            </Text>
            <Text className="text-sm font-semibold text-gray-800">{toPrice(item.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View className="mt-4 border-t border-[#e8efff] pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">Price</Text>
          <Text className="text-sm font-semibold text-gray-800">{toPrice(subtotal)}</Text>
        </View>
        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">Discount</Text>
          <Text className="text-sm font-semibold text-gray-800">{toPrice(discount)}</Text>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-base font-bold text-gray-800">Total</Text>
          <Text className="text-base font-extrabold text-[#4157b3]">{toPrice(total)}</Text>
        </View>
      </View>
    </View>
  );
}
