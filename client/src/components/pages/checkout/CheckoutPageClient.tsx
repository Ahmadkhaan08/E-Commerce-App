"use client";
import Container from "@/components/common/Container";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import PriceFormatter from "@/components/common/PriceFormatter";
import CheckoutSkeleton from "@/components/skeleton/CheckoutSkeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Address } from "@/lib/addressApi";
import { getOrderById, Order } from "@/lib/orderApi";
import { useCartStore, useUserStore } from "@/lib/store";
import { CheckCircle, CreditCard, Lock } from "lucide-react";
import Image from "next/image";
// import { Address } from '@/types/type';
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AddressSelection from "../shop/AddressSelection";

const CheckoutPageClient = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [address, setAddress] = useState<Address[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { auth_token, authUser, isAuthenticated, verfiyAuth } = useUserStore();
  const { cartItemsWithQuantities, clearCart } = useCartStore();
  const orderId = searchParams.get("orderId");
  const TAX_RATE = 0.08;
  // Verify authentiaction on mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) {
        await verfiyAuth();
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, [auth_token, authUser, verfiyAuth]);
  // Wait for auth check to complete
  useEffect(() => {
    if (authLoading) {
      return;
    }
    // Check if user authenticated
    if (!isAuthenticated || !authUser || !auth_token) {
      router.push("/auth/signin");
      return;
    }
    // Load user Address
    if (authUser.addresses && authUser.addresses.length > 0) {
      setAddress(authUser.addresses);
      // Auto select address logic
      if (authUser.addresses.length === 1) {
        // If only one address,select automatically
        setSelectedAddress(authUser.addresses[0]);
      } else {
        // If multiple address prefer Default one
        const defaultAddress = authUser.addresses.find(
          (addr) => addr.isDefault,
        );
        setSelectedAddress(defaultAddress || authUser.addresses[0]);
      }
    }

    const initializeOrder = async () => {
      setIsLoading(true);
      try {
        if (orderId) {
          // If orderId is provided, load existing order
          console.log("Checkout:Fetching Orders:", orderId);
          const orderData = await getOrderById(orderId, auth_token);
          if (orderData) {
            console.log("Checkout: Order fetched successfully!");
            setOrder(orderData);
          } else {
            toast.error("Order not found!");
            router.push("/user/cart");
          }
        } else {
          // If no orderId, check if we have cart items
          if (cartItemsWithQuantities.length === 0) {
            toast.error("Your cart is empty!");
            router.push("/user/cart");
            return;
          }
        }

        // Create a temporary order to display
        const tempOrder: Order = {
          _id: "temp",
          userId: authUser._id,
          items: cartItemsWithQuantities.map((item) => ({
            productId: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
          total: cartItemsWithQuantities.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0,
          ),
          status: "pending",
          shippingAddress: {
            street: "",
            city: "",
            country: "",
            postalCode: "",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setOrder(tempOrder);
      } catch (error) {
        console.error("Error initializing checkout:", error);
        toast.error("Failed to load checkout details");
        router.push("/user/cart");
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrder();
  }, [
    orderId,
    auth_token,
    isAuthenticated,
    authUser,
    authLoading,
    cartItemsWithQuantities,
    router,
  ]);

  const handleAddressesUpdate = (updateAddresses: Address[]) => {
    setAddress(updateAddresses);
    // auto select address logic
    if (updateAddresses.length === 1) {
      // If only one address, select it automatically
      setSelectedAddress(updateAddresses[0]);
    } else if (updateAddresses.length > 1) {
      // If multiple addresses, prefer default or keep current selection
      const defaultAddress = updateAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (
        !selectedAddress ||
        !updateAddresses.find((addr) => addr._id === selectedAddress._id)
      ) {
        // if no default and current selection is invalid,select first
        setSelectedAddress(updateAddresses[0]);
      }
    } else {
      // No Address, Clear Selection
      setSelectedAddress(null);
    }
  };

  const calculateSubTotal = () => {
    if (!order) return 0;
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const calculateShipping = () => {
    const subTotal = calculateSubTotal();
    return subTotal > 2000 ? 0 : 250;
  };

  const calculateTax = () => {
    const subTotal = calculateSubTotal();
    return subTotal * TAX_RATE;
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateShipping() + calculateTax();
  };

  //   handle stripe checkout function
  const handleStripeCheckout = async () => {};

  if (isLoading || authLoading) {
    return <CheckoutSkeleton />;
  }

  if (!order) {
    return (
      <Container className="py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The order you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button
              onClick={() => router.push("/cart")}
              className="bg-babyshopSky hover:bg-babyshopSky border-babyshopSky"
            >
              Return to Cart
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageBreadCrumb
        items={[{ label: "Cart", href: "/cart" }]}
        currentPage="Checkout"
      />
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your order</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Addresses */}
          <AddressSelection
            selectedAddress={selectedAddress}
            onAddressSelect={setSelectedAddress}
            addresses={address}
            onAddressUpdate={handleAddressesUpdate}
          />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm  p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-300 p-2">
              Order Details
            </h2>
            <div>
              {/* Order Items */}
              <div className="space-y-4">
                {order?.items.map((item, index) => (
                  <div
                    key={index.toString()}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg"
                  >
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg  border border-babyshopSky overflow-hidden flex-shrink-0">
                      {item?.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover "
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <CreditCard className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity:{item.quantity} ×{" "}
                        <PriceFormatter amount={item.price} />
                      </p>
                    </div>
                    <div className="text-right">
                      <PriceFormatter
                        amount={item.price * item.quantity}
                        className="text-base font-semibold text-gray-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Payment Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {" "}
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Stripe Checkout
                    </h3>
                    <p className="text-sm text-gray-600">
                      Secure payment with stripe
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </Container>
  );
};

export default CheckoutPageClient;
