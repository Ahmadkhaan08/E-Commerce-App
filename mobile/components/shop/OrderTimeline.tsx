import React from "react";
import { Text, View } from "react-native";

type TimelineStep = {
  key: string;
  label: string;
  complete: boolean;
  active: boolean;
};

type OrderTimelineProps = {
  status: string;
};

const statusOrder = ["pending", "processing", "paid", "completed"];

function getProgressIndex(status: string) {
  const value = status.toLowerCase();
  const index = statusOrder.indexOf(value);
  return index === -1 ? 0 : index;
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const progressIndex = getProgressIndex(status);

  const steps: TimelineStep[] = [
    { key: "ordered", label: "Ordered", complete: progressIndex > 0, active: progressIndex === 0 },
    { key: "shipped", label: "Shipped", complete: progressIndex > 1, active: progressIndex === 1 },
    { key: "out", label: "Out for Delivery", complete: progressIndex > 2, active: progressIndex === 2 },
    { key: "done", label: "Delivered", complete: progressIndex > 2, active: progressIndex >= 3 },
  ];

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-base font-bold text-gray-800">Tracking Timeline</Text>

      <View className="mt-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const circleClass = step.complete
            ? "bg-[#8f9dff]"
            : step.active
              ? "bg-[#b5c2ff]"
              : "bg-[#d9e4ff]";

          return (
            <View key={step.key} className="flex-row">
              <View className="items-center">
                <View className={`h-4 w-4 rounded-full ${circleClass}`} />
                {!isLast ? <View className="h-8 w-[2px] bg-[#dbe6ff]" /> : null}
              </View>

              <View className="ml-3 pb-5">
                <Text className={`text-sm font-semibold ${step.active || step.complete ? "text-gray-800" : "text-gray-500"}`}>
                  {step.label}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  {step.active ? "In progress" : step.complete ? "Completed" : "Pending"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
