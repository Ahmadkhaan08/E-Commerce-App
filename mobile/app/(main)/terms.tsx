import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { ScrollView, Text, View } from "react-native";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing and using BabyMart, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.",
  },
  {
    title: "2. Use of Service",
    body: "You agree to use BabyMart only for lawful purposes. You must not use our service in any way that causes, or may cause, damage to the app or impairment of the availability of the app.",
  },
  {
    title: "3. Product Information",
    body: "We strive to ensure that all product descriptions, images, and prices are accurate. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.",
  },
  {
    title: "4. Orders & Payment",
    body: "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason at any time. Payment must be received prior to dispatch of products.",
  },
  {
    title: "5. Returns & Refunds",
    body: "We offer returns within 7 days of delivery for unused products in original packaging. Refunds will be processed within 5-10 business days after receiving the returned item.",
  },
  {
    title: "6. Limitation of Liability",
    body: "BabyMart shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.",
  },
  {
    title: "7. Changes to Terms",
    body: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of BabyMart after changes constitutes acceptance of the new terms.",
  },
];

export default function TermsScreen() {
  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Terms & Conditions" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
      >
        <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
          <Text className="text-lg font-bold text-[#1f2a44]">
            Terms & Conditions
          </Text>
          <Text className="mt-1 text-xs text-[#6e7a97]">
            Last updated: April 2026
          </Text>

          {sections.map((section) => (
            <View key={section.title} className="mt-4">
              <Text className="text-sm font-bold text-[#1f2a44]">
                {section.title}
              </Text>
              <Text className="mt-1 text-sm leading-6 text-[#63739a]">
                {section.body}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
