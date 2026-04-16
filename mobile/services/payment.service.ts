import { apiRequest } from "@/constants/mobileApi";

export type StripeCheckoutItem = {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  quantity: number;
  images?: string[];
};

export type CreateStripeCheckoutSessionInput = {
  orderId: string;
  items: StripeCheckoutItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  currency?: string;
};

export type CreateStripeCheckoutSessionResponse = {
  success: boolean;
  url?: string;
  sessionId?: string;
  paymentIntentId?: string;
  message?: string;
};

export type ConfirmPaymentInput = {
  orderId: string;
  paymentIntentId?: string;
  sessionId?: string;
  status?: "succeeded" | "failed" | "canceled";
};

export const createStripeCheckoutSession = async (
  input: CreateStripeCheckoutSessionInput,
  token: string,
) => {
  return await apiRequest<CreateStripeCheckoutSessionResponse>(
    "/api/payment/create-session",
    {
      method: "POST",
      body: JSON.stringify({
        orderId: input.orderId,
        order_id: input.orderId,
        items: input.items,
        customerEmail: input.customerEmail,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
        metadata: input.metadata,
        currency: input.currency ?? "pkr",
      }),
    },
    token,
  );
};

export const confirmPayment = async (input: ConfirmPaymentInput, token: string) => {
  return await apiRequest<{ success?: boolean; message?: string; paymentIntentId?: string; status?: string }>(
    "/api/payment/confirm",
    {
      method: "POST",
      body: JSON.stringify({
        orderId: input.orderId,
        order_id: input.orderId,
        paymentIntentId: input.paymentIntentId,
        sessionId: input.sessionId,
        status: input.status ?? "succeeded",
      }),
    },
    token,
  );
};

export const updateOrderToPaid = async (
  orderId: string,
  paymentIntentId: string | undefined,
  stripeSessionId: string | undefined,
  token: string,
) => {
  try {
    await apiRequest<{ success?: boolean }>(
      "/api/orders/update-status",
      {
        method: "PUT",
        body: JSON.stringify({
          orderId,
          status: "paid",
          paymentIntentId,
          stripeSessionId,
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
          stripeSessionId,
        }),
      },
      token,
    );
  }
};
