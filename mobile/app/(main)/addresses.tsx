import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { addUserAddress, getAuthToken, getMyProfile, updateUserAddress } from "@/constants/mobileApi";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Address } from "@/types/type";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

type AddressForm = {
  street: string;
  city: string;
  country: string;
  postalCode: string;
};

const EMPTY_FORM: AddressForm = {
  street: "",
  city: "",
  country: "",
  postalCode: "",
};

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

  const updateForm = (key: keyof AddressForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadAddresses = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const data = await getMyProfile(token);
      setAddresses(Array.isArray(data.addresses) ? (data.addresses as Address[]) : []);
    } catch (requestError) {
      showErrorToast("Could not load addresses", requestError instanceof Error ? requestError.message : undefined);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        await loadAddresses();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [loadAddresses]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingAddressId(null);
    setShowForm(false);
  };

  const onAddPress = () => {
    setForm(EMPTY_FORM);
    setEditingAddressId(null);
    setShowForm(true);
  };

  const onEditPress = (address: Address) => {
    setForm({
      street: address.street,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode,
    });
    setEditingAddressId(address._id);
    setShowForm(true);
  };

  const saveAddress = async () => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!form.street.trim() || !form.city.trim() || !form.country.trim() || !form.postalCode.trim()) {
      showErrorToast("Incomplete address", "Please fill all fields.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingAddressId) {
        const response = await updateUserAddress(
          editingAddressId,
          {
            street: form.street.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),
          },
          token,
        );

        if (Array.isArray(response.addresses)) {
          setAddresses(response.addresses as Address[]);
        } else {
          await loadAddresses();
        }
        showSuccessToast("Address updated", "Your address has been updated.");
      } else {
        const response = await addUserAddress(
          {
            street: form.street.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),
            isDefault: addresses.length === 0,
          },
          token,
        );

        if (Array.isArray(response.addresses)) {
          setAddresses(response.addresses as Address[]);
        } else {
          await loadAddresses();
        }
        showSuccessToast("Address added", "New address saved successfully.");
      }

      resetForm();
    } catch (requestError) {
      showErrorToast("Address save failed", requestError instanceof Error ? requestError.message : "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Addresses" />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 14, paddingBottom: 24 }}>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-bold text-[#1f2a44]">Saved Addresses</Text>
          <Pressable onPress={onAddPress} className="rounded-xl bg-[#6f84ec] px-4 py-2" style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}>
            <Text className="text-xs font-semibold text-white">Add Address</Text>
          </Pressable>
        </View>

        {showForm ? (
          <View className="mb-4 rounded-2xl border border-[#dce7ff] bg-white p-4">
            <Text className="mb-3 text-sm font-bold text-[#1f2a44]">{editingAddressId ? "Edit Address" : "Add Address"}</Text>

            <View className="gap-2">
              <TextInput value={form.street} onChangeText={(value) => updateForm("street", value)} placeholder="Street" className="rounded-xl border border-[#dde7ff] bg-[#f8fbff] px-3 py-2.5 text-sm text-[#1f2a44]" />
              <TextInput value={form.city} onChangeText={(value) => updateForm("city", value)} placeholder="City" className="rounded-xl border border-[#dde7ff] bg-[#f8fbff] px-3 py-2.5 text-sm text-[#1f2a44]" />
              <TextInput value={form.country} onChangeText={(value) => updateForm("country", value)} placeholder="Country" className="rounded-xl border border-[#dde7ff] bg-[#f8fbff] px-3 py-2.5 text-sm text-[#1f2a44]" />
              <TextInput value={form.postalCode} onChangeText={(value) => updateForm("postalCode", value)} placeholder="Postal Code" className="rounded-xl border border-[#dde7ff] bg-[#f8fbff] px-3 py-2.5 text-sm text-[#1f2a44]" />
            </View>

            <View className="mt-3 flex-row gap-2">
              <Pressable
                onPress={saveAddress}
                disabled={submitting}
                className="flex-1 items-center rounded-xl bg-[#6f84ec] py-2.5"
                style={({ pressed }) => ({ opacity: pressed || submitting ? 0.82 : 1 })}
              >
                {submitting ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-sm font-semibold text-white">Save</Text>}
              </Pressable>
              <Pressable onPress={resetForm} className="flex-1 items-center rounded-xl bg-[#edf2ff] py-2.5" style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
                <Text className="text-sm font-semibold text-[#3f5fd6]">Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#7d8ff6" />
          </View>
        ) : addresses.length === 0 ? (
          <View className="rounded-2xl border border-[#dce7ff] bg-white p-4">
            <Text className="text-sm text-[#63739a]">No addresses found. Tap Add Address to save your first one.</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address._id} className="mb-3 rounded-2xl border border-[#dce7ff] bg-white p-4">
              <Text className="text-sm font-bold text-[#1f2a44]">{address.street}</Text>
              <Text className="mt-1 text-sm text-[#63739a]">{address.city}, {address.country} {address.postalCode}</Text>
              {address.isDefault ? <Text className="mt-2 self-start rounded-full bg-[#eef3ff] px-2 py-1 text-xs font-semibold text-[#4e64cb]">Default</Text> : null}
              <Pressable onPress={() => onEditPress(address)} className="mt-3 self-start rounded-xl bg-[#edf2ff] px-3 py-1.5">
                <Text className="text-xs font-semibold text-[#3f5fd6]">Edit</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
