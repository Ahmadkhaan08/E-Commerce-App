import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import { ScrollView, Text, View } from "react-native";

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect personal information you provide when creating an account, placing orders, or contacting support. This includes your name, email address, phone number, shipping address, and payment details.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to process orders, send order confirmations and updates, improve our services, personalize your shopping experience, and communicate promotional offers with your consent.",
  },
  {
    title: "3. Information Sharing",
    body: "We do not sell your personal information. We may share your data with trusted service providers who help us operate our platform, process payments, and deliver products to you.",
  },
  {
    title: "4. Data Security",
    body: "We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "5. Cookies & Tracking",
    body: "Our app may use local storage and analytics tools to enhance your experience and understand usage patterns. You can manage these preferences through your device settings.",
  },
  {
    title: "6. Your Rights",
    body: "You have the right to access, correct, or delete your personal information at any time. You can update your profile directly in the app or contact our support team for assistance.",
  },
  {
    title: "7. Children's Privacy",
    body: "BabyMart is intended for use by parents and guardians. We do not knowingly collect personal information from children under the age of 13 without parental consent.",
  },
  {
    title: "8. Policy Updates",
    body: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last updated' date.",
  },
];

export default function PrivacyScreen() {
  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Privacy Policy" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}
      >
        <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
          <Text className="text-lg font-bold text-[#1f2a44]">
            Privacy Policy
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
