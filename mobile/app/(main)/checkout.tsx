import CheckoutSummary from "@/components/shop/CheckoutSummary";
import PaymentOption from "@/components/shop/PaymentOption";
import ScreenWrapper from "@/components/common/ScreenWrapper";
import InnerScreenHeader from "@/components/common/InnerScreenHeader";
import { apiRequest, getAuthToken } from "@/constants/mobileApi";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
// import { safeInitPaymentSheet, safePresentPaymentSheet } from "@/lib/stripeClient";
import { useStore } from "@/store/useStore";
import { Address } from "@/types/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ProfileResponse = {
  _id: string;
  name: string;
  addresses: Address[];
};

type CartLine = {
  productId: {
    _id: string;
    name: string;
    image?: string;
    price: number;
    discountPercentage?: number;
  };
  quantity: number;
};

type CartResponse = {
  cart: CartLine[];
};

type CreateOrderResponse = {
  success: boolean;
  order: {
    _id: string;
    total?: number;
  };
};

type PaymentIntentResponse = {
  clientSecret?: string;
  paymentIntentClientSecret?: string;
  paymentIntentId?: string;
  customerId?: string;
  customerEphemeralKeySecret?: string;
};

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const refreshCounts = useStore((s) => s.refreshCounts);
  const [userId, setUserId] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [items, setItems] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Credit / Debit Card");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addingAddress, setAddingAddress] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const selectedAddress = useMemo(
    () => addresses.find((address) => address._id === selectedAddressId) || addresses.find((address) => address.isDefault),
    [addresses, selectedAddressId],
  );

  const loadCheckoutData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError(null);
      const [profileData, cartData] = await Promise.all([
        apiRequest<ProfileResponse>("/api/auth/profile", undefined, token),
        apiRequest<CartResponse>("/api/carts", undefined, token),
      ]);

      setUserId(profileData._id);
      setAddresses(Array.isArray(profileData.addresses) ? profileData.addresses : []);
      const preferredAddress = profileData.addresses.find((address) => address.isDefault) || profileData.addresses[0];
      setSelectedAddressId(preferredAddress?._id || "");
      setItems(Array.isArray(cartData.cart) ? cartData.cart : []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load checkout");
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadCheckoutData();
      setLoading(false);
    };

    run();
  }, [loadCheckoutData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCheckoutData();
    setRefreshing(false);
  }, [loadCheckoutData]);

  const submitNewAddress = async () => {
    if (!userId) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!street.trim() || !city.trim() || !country.trim() || !postalCode.trim()) {
      setError("Please fill all address fields");
      showErrorToast("Address required", "Please fill all address fields.");
      return;
    }

    try {
      const response = await apiRequest<{ addresses: Address[] }>(
        `/api/users/${userId}/address`,
        {
          method: "POST",
          body: JSON.stringify({
            street: street.trim(),
            city: city.trim(),
            country: country.trim(),
            postalCode: postalCode.trim(),
            isDefault: addresses.length === 0,
          }),
        },
        token,
      );

      setAddresses(response.addresses || []);
      const last = response.addresses?.[response.addresses.length - 1];
      if (last?._id) {
        setSelectedAddressId(last._id);
      }
      setStreet("");
      setCity("");
      setCountry("");
      setPostalCode("");
      setAddingAddress(false);
      showSuccessToast("Address saved", "Your address has been added.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to add address");
      showErrorToast("Address save failed", requestError instanceof Error ? requestError.message : "Please try again.");
    }
  };

  const getOrderTotal = useMemo(() => {
    return items.reduce((sum, line) => sum + line.productId.price * line.quantity, 0);
  }, [items]);

  const parsePaymentIntentId = (clientSecret: string) => {
    const [firstPart] = clientSecret.split("_secret");
    return firstPart || "";
  };

  const createPaymentIntent = async (orderId: string, amount: number, token: string) => {
    return await apiRequest<PaymentIntentResponse>(
      "/api/payment/create-intent",
      {
        method: "POST",
        body: JSON.stringify({
          orderId,
          order_id: orderId,
          amount,
          currency: "pkr",
          paymentMethod,
        }),
      },
      token,
    );
  };

  const confirmPaymentOnBackend = async (orderId: string, paymentIntentId: string, token: string) => {
    await apiRequest<{ success?: boolean; message?: string }>(
      "/api/payment/confirm",
      {
        method: "POST",
        body: JSON.stringify({
          orderId,
          order_id: orderId,
          paymentIntentId,
          status: "succeeded",
        }),
      },
      token,
    );
  };

  const markOrderPaid = async (orderId: string, paymentIntentId: string, token: string) => {
    try {
      await apiRequest<{ success?: boolean }>(
        "/api/orders/update-status",
        {
          method: "PUT",
          body: JSON.stringify({
            orderId,
            status: "paid",
            paymentIntentId,
          }),
        },
        token,
      );
    } catch {
      await apiRequest<{ success?: boolean }>(
        `/api/orders/${orderId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: "paid",
            paymentIntentId,
          }),
        },
        token,
      );
    }
  };

  const clearCartAfterCheckout = async (token: string) => {
    try {
      await apiRequest<{ success?: boolean }>("/api/carts", { method: "DELETE" }, token);
    } catch {
      // Cart clear failures should not block payment completion UX.
    }
  };

  const navigateToSuccess = (orderId: string, amount: number) => {
    const addressLabel = selectedAddress
      ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.country} ${selectedAddress.postalCode}`
      : "N/A";

    router.replace({
      pathname: "/(main)/payment-success",
      params: {
        orderId,
        total: String(amount),
        paymentMethod,
        address: addressLabel,
      },
    });
  };

  const payWithStripe = async (orderId: string, amount: number, token: string) => {
    const intentResponse = await createPaymentIntent(orderId, amount, token);

    const clientSecret = intentResponse.clientSecret || intentResponse.paymentIntentClientSecret;
    if (!clientSecret) {
      throw new Error("Payment intent client secret not received");
    }

    // let initResult;

    // try {
    //   // initResult = await safeInitPaymentSheet({
    //   //   merchantDisplayName: "Bacha Bazar",
    //   //   paymentIntentClientSecret: clientSecret,
    //   //   customerId: intentResponse.customerId,
    //   //   customerEphemeralKeySecret: intentResponse.customerEphemeralKeySecret,
    //   //   allowsDelayedPaymentMethods: false,
    //   //   defaultBillingDetails: {
    //   //     name: "Bacha Bazar Customer",
    //   //   },
    //   // });
    // } catch {
    //   throw new Error("Stripe SDK is not available in this build. Please use a development build instead of Expo Go.");
    // }

    // if (initResult.error) {
    //   throw new Error(initResult.error.message);
    // }

    // const sheetResult = await safePresentPaymentSheet();

    // if (sheetResult.error) {
    //   if (sheetResult.error.code === "Canceled") {
    //     showErrorToast("Payment cancelled", "You cancelled the payment flow.");
    //     return { paid: false, cancelled: true };
    //   }

    //   throw new Error(sheetResult.error.message);
    // }

    const paymentIntentId = intentResponse.paymentIntentId || parsePaymentIntentId(clientSecret);
    if (!paymentIntentId) {
      throw new Error("Payment intent id missing after payment.");
    }

    await confirmPaymentOnBackend(orderId, paymentIntentId, token);
    await markOrderPaid(orderId, paymentIntentId, token);

    return { paid: true, cancelled: false };
  };

  const placeOrder = async () => {
    if (!agreed) {
      setError("Please agree to Terms & Conditions");
      showErrorToast("Terms required", "Please agree to Terms & Conditions.");
      return;
    }

    if (!selectedAddress) {
      setError("Please select or add an address");
      showErrorToast("Address required", "Please select or add an address.");
      return;
    }

    if (!items.length) {
      setError("Your cart is empty");
      showErrorToast("Cart is empty", "Add items before placing order.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setPlacing(true);
      setPaymentLoading(true);
      setError(null);

      const payloadItems = items.map((line) => ({
        _id: line.productId._id,
        name: line.productId.name,
        price: line.productId.price,
        quantity: line.quantity,
        image: line.productId.image,
      }));

      const response = await apiRequest<CreateOrderResponse>(
        "/api/orders",
        {
          method: "POST",
          body: JSON.stringify({
            items: payloadItems,
            shippingAddress: {
              street: selectedAddress.street,
              city: selectedAddress.city,
              country: selectedAddress.country,
              postalCode: selectedAddress.postalCode,
            },
            paymentMethod,
          }),
        },
        token,
      );

      const orderId = response.order._id;
      const amount = response.order.total ?? getOrderTotal;

      if (paymentMethod !== "Cash on Delivery") {
        const paymentResult = await payWithStripe(orderId, amount, token);
        if (paymentResult.cancelled) {
          return;
        }
      }

      await clearCartAfterCheckout(token);
      await refreshCounts();
      showSuccessToast("Order confirmed", "Your payment/order was processed successfully.");
      navigateToSuccess(orderId, amount);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to place order");
      showErrorToast("Checkout failed", requestError instanceof Error ? requestError.message : "Please try again.");
    } finally {
      setPaymentLoading(false);
      setPlacing(false);
    }
  };

  return (
    <ScreenWrapper>
      <InnerScreenHeader title="Checkout" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7d8ff6" />}
      >
        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#7d8ff6" />
          </View>
        ) : null}

        {error ? (
          <View className="mb-3 rounded-2xl bg-white p-3 shadow-sm">
            <Text className="text-sm text-gray-500">{error}</Text>
          </View>
        ) : null}

        <View className="rounded-2xl bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-800">Address</Text>
            <Pressable onPress={() => setAddingAddress((prev) => !prev)} className="rounded-full bg-[#eaf0ff] px-3 py-2">
              <Text className="text-xs font-semibold text-[#3f54ac]">Add New</Text>
            </Pressable>
          </View>

          {addresses.length === 0 ? <Text className="mt-2 text-sm text-gray-500">No address found yet.</Text> : null}

          <View className="mt-3 gap-2">
            {addresses.map((address) => (
              <Pressable
                key={address._id}
                onPress={() => setSelectedAddressId(address._id)}
                className={`rounded-xl border p-3 ${selectedAddressId === address._id ? "border-[#9aabff] bg-[#eef2ff]" : "border-[#e1e9ff] bg-white"}`}
              >
                <Text className="text-sm font-semibold text-gray-800">
                  {address.street}, {address.city}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  {address.country} {address.postalCode}
                </Text>
              </Pressable>
            ))}
          </View>

          {addingAddress ? (
            <View className="mt-3 gap-2">
              <TextInput value={street} onChangeText={setStreet} placeholder="Street" className="rounded-xl border border-[#dde7ff] bg-[#f8faff] px-3 py-2 text-sm" />
              <TextInput value={city} onChangeText={setCity} placeholder="City" className="rounded-xl border border-[#dde7ff] bg-[#f8faff] px-3 py-2 text-sm" />
              <TextInput value={country} onChangeText={setCountry} placeholder="Country" className="rounded-xl border border-[#dde7ff] bg-[#f8faff] px-3 py-2 text-sm" />
              <TextInput value={postalCode} onChangeText={setPostalCode} placeholder="Postal Code" className="rounded-xl border border-[#dde7ff] bg-[#f8faff] px-3 py-2 text-sm" />
              <Pressable onPress={submitNewAddress} disabled={placing || paymentLoading} className="items-center rounded-xl bg-[#7d8ff6] py-2" style={({ pressed }) => ({ opacity: pressed || placing || paymentLoading ? 0.8 : 1 })}>
                <Text className="text-sm font-semibold text-white">Save Address</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View className="mt-3">
          <CheckoutSummary
            items={items.map((line) => ({
              id: line.productId._id,
              name: line.productId.name,
              price: line.productId.price,
              quantity: line.quantity,
              discountPercentage: line.productId.discountPercentage,
            }))}
          />
        </View>

        <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="text-base font-bold text-gray-800">Payment Methods</Text>
          <View className="mt-3 gap-2">
            {["Credit / Debit Card", "Google Pay", "Cash on Delivery"].map((method) => (
              <PaymentOption
                key={method}
                label={method}
                description={method === "Credit / Debit Card" ? "Secure card payment" : undefined}
                selected={paymentMethod === method}
                onPress={() => setPaymentMethod(method)}
              />
            ))}
          </View>
        </View>

        <Pressable onPress={() => setAgreed((prev) => !prev)} className="mt-3 flex-row items-center rounded-2xl bg-white p-4 shadow-sm">
          <View
            className={`h-5 w-5 items-center justify-center rounded border ${agreed ? "border-[#6278e2] bg-[#6278e2]" : "border-[#ccd8ff] bg-white"}`}
          >
            {agreed ? <Feather name="check" size={12} color="#fff" /> : null}
          </View>
          <Text className="ml-3 text-sm text-gray-700">Agree to Terms & Conditions</Text>
        </Pressable>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#dbe6ff] bg-white px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <Pressable onPress={placeOrder} disabled={placing || paymentLoading} className={`items-center rounded-2xl py-3 ${placing || paymentLoading ? "bg-[#98a8e8]" : "bg-[#7d8ff6]"}`}>
          {placing || paymentLoading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-sm font-bold text-white">Place Order</Text>}
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
