import { loadStripe } from "@stripe/stripe-js";
import { fetchWithConfig } from "./config";
// This should be your Stripe publishable key
const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
export const stripePromise = loadStripe(stripePublishableKey);

export interface StripeCheckoutItem {
  name: string;
  description?: string;
  amount: number; // in major currency units (e.g., PKR)
  currency: string;
  quantity: number;
  images?: string[];
}

export interface CheckoutSessionRequest {
  items: StripeCheckoutItem[];
  successUrl: string;
  cancelUrl: string;
  shippingAmount?: number; // in major currency units
  taxAmount?: number; // in major currency units
  customerEmail?: string;
  metadata?: Record<string, string>;
}

// Create a checkout session
export const createCheckoutSession = async (
  data: CheckoutSessionRequest,
): Promise<{ sessionId: string } | { error: string }> => {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { sessionId } = await response.json();
    return { sessionId };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Redirect to Stripe Checkout
// Modern approach: use the session URL directly from your backend
export const redirectToCheckout = async (checkoutUrl: string) => {
  if (!checkoutUrl) {
    throw new Error("Checkout URL is required");
  }

  // Redirect to the Stripe Checkout page
  window.location.href = checkoutUrl;
};
// export const redirectToCheckout = async (checkoutUrl: string) => {
//   if (!checkoutUrl) {
//     throw new Error("Checkout URL is required");
//   }

//   if (typeof window === "undefined") {
//     throw new Error("Checkout redirect must run in the browser");
//   }

//   window.location.assign(checkoutUrl);
// };
