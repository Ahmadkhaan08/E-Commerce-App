import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import orderModel from "../models/orderModel.js";

const FREE_SHIPPING_THRESHOLD = 2000;
const BASE_SHIPPING_FEE = 250;
const TAX_RATE = 0.08;

const getStripeClient = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    const error = new Error("STRIPE_SECRET_KEY is not configured");
    error.statusCode = 500;
    throw error;
  }

  return new Stripe(stripeSecretKey);
};

const toMinorAmount = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.round(value * 100);
};

const getDiscountedUnitPrice = (price, discountPercentage) => {
  const normalizedPrice = Number(price) || 0;
  const normalizedDiscount = Math.min(100, Math.max(0, Number(discountPercentage) || 0));
  return Math.max(
    Math.round(normalizedPrice - (normalizedPrice * normalizedDiscount) / 100),
    0,
  );
};

const getOrderForUser = async (orderId, user) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = order.userId.toString() === user._id.toString();
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) {
    const error = new Error("Not authorized to access this order");
    error.statusCode = 403;
    throw error;
  }

  return order;
};

export const createStripeSession = asyncHandler(async (req, res) => {
  const {
    orderId,
    order_id,
    currency = "pkr",
    successUrl,
    cancelUrl,
    customerEmail,
    metadata = {},
  } = req.body;
  const resolvedOrderId = orderId || order_id;

  if (!resolvedOrderId) {
    res.status(400);
    throw new Error("orderId is required");
  }

  const order = await getOrderForUser(resolvedOrderId, req.user);

  if (order.status !== "pending") {
    res.status(400);
    throw new Error("Payment can only be started for pending orders");
  }

  const stripe = getStripeClient();
  const amountInMinorUnit = toMinorAmount(order.total);
  if (amountInMinorUnit <= 0) {
    res.status(400);
    throw new Error("Order total must be greater than zero");
  }

  const normalizedCurrency = String(currency || "pkr").toLowerCase();

  if (successUrl && cancelUrl) {
    const originalSubtotal = order.items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0,
    );

    const computedSubtotal = order.items.reduce(
      (sum, item) =>
        sum +
        getDiscountedUnitPrice(item.price, item.discountPercentage) *
          Number(item.quantity || 0),
      0,
    );

    const subtotal = Number(order.subtotal) > 0 ? Number(order.subtotal) : computedSubtotal;
    const computedTaxAmount = Math.round(subtotal * TAX_RATE);
    const computedShippingFee = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_FEE;

    const taxAmount = Number(order.taxAmount) > 0 ? Number(order.taxAmount) : computedTaxAmount;
    const shippingFee =
      Number(order.shippingFee) > 0 || computedShippingFee === 0
        ? Number(order.shippingFee || 0)
        : computedShippingFee;

    const discountAmount = Math.max(Math.round(originalSubtotal - subtotal), 0);

    const lineItems = order.items
      .map((item) => {
        const unitAmount = toMinorAmount(item.price);
        if (unitAmount <= 0) {
          return null;
        }

        return {
          quantity: Math.max(1, Number(item.quantity) || 1),
          price_data: {
            currency: normalizedCurrency,
            unit_amount: unitAmount,
            product_data: {
              name: item.name || "Product",
              images: item.image ? [item.image] : [],
            },
          },
        };
      })
      .filter(Boolean);

    if (shippingFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: normalizedCurrency,
          unit_amount: toMinorAmount(shippingFee),
          product_data: {
            name: "Shipping Fee",
            description: "Delivery charges",
          },
        },
      });
    }

    if (taxAmount > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: normalizedCurrency,
          unit_amount: toMinorAmount(taxAmount),
          product_data: {
            name: "Tax (8%)",
            description: "Order tax",
          },
        },
      });
    }

    if (!lineItems.length) {
      res.status(400);
      throw new Error("Unable to create checkout session for empty order items");
    }

    let discountPayload;
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: toMinorAmount(discountAmount),
        currency: normalizedCurrency,
        duration: "once",
        name: "Order discount",
      });

      discountPayload = [{ coupon: coupon.id }];
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      discounts: discountPayload,
      metadata: {
        orderId: String(order._id),
        userId: String(req.user._id),
        ...metadata,
      },
      customer_email: customerEmail || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    order.stripeSessionId = checkoutSession.id;
    if (typeof checkoutSession.payment_intent === "string") {
      order.paymentIntentId = checkoutSession.payment_intent;
    }
    await order.save();

    res.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      paymentIntentId:
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : undefined,
      message: "Stripe checkout session created",
    });
    return;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInMinorUnit,
    currency: normalizedCurrency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      orderId: String(order._id),
      userId: String(req.user._id),
    },
  });

  order.paymentIntentId = paymentIntent.id;
  await order.save();

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentClientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    sessionId: paymentIntent.id,
  });
});

export const confirmStripePayment = asyncHandler(async (req, res) => {
  const { orderId, order_id, paymentIntentId, sessionId } = req.body;
  const resolvedOrderId = orderId || order_id;

  if (!resolvedOrderId) {
    res.status(400);
    throw new Error("orderId is required");
  }

  const order = await getOrderForUser(resolvedOrderId, req.user);
  let intentId = paymentIntentId || order.paymentIntentId;
  let resolvedSessionId = sessionId || order.stripeSessionId;

  const stripe = getStripeClient();

  if ((!intentId || !resolvedSessionId) && sessionId?.startsWith("cs_")) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    resolvedSessionId = checkoutSession.id;

    if (typeof checkoutSession.payment_intent === "string") {
      intentId = checkoutSession.payment_intent;
    } else if (checkoutSession.payment_intent?.id) {
      intentId = checkoutSession.payment_intent.id;
    }

    const checkoutOrderId = checkoutSession?.metadata?.orderId;
    if (checkoutOrderId && checkoutOrderId !== String(order._id)) {
      res.status(400);
      throw new Error("Checkout session does not belong to this order");
    }

    if (checkoutSession.payment_status !== "paid") {
      res.status(400);
      throw new Error(`Payment not completed. Current session payment status: ${checkoutSession.payment_status}`);
    }
  }

  if (!intentId && !resolvedSessionId) {
    res.status(400);
    throw new Error("paymentIntentId or sessionId is required");
  }

  if (!intentId && resolvedSessionId?.startsWith("cs_")) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(resolvedSessionId, {
      expand: ["payment_intent"],
    });

    if (typeof checkoutSession.payment_intent === "string") {
      intentId = checkoutSession.payment_intent;
    } else if (checkoutSession.payment_intent?.id) {
      intentId = checkoutSession.payment_intent.id;
    }
  }

  if (!intentId) {
    res.status(400);
    throw new Error("Could not resolve payment intent from provided identifiers");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(intentId);
  const metadataOrderId = paymentIntent?.metadata?.orderId;

  if (metadataOrderId && metadataOrderId !== String(order._id)) {
    res.status(400);
    throw new Error("Payment does not belong to this order");
  }

  if (paymentIntent.status !== "succeeded") {
    res.status(400);
    throw new Error(`Payment not completed. Current status: ${paymentIntent.status}`);
  }

  order.paymentIntentId = paymentIntent.id;
  if (resolvedSessionId) {
    order.stripeSessionId = resolvedSessionId;
  }
  await order.save();

  res.json({
    success: true,
    message: "Payment verified successfully",
    paymentIntentId: paymentIntent.id,
    sessionId: resolvedSessionId,
    status: paymentIntent.status,
  });
});
