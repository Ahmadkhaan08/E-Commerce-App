import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(secretKey);

interface StripeCheckoutItem {
  name: string;
  description?: string;
  amount: number; // smallest currency unit
  currency: string;
  quantity: number;
  images?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const {
      items,
      successUrl,
      cancelUrl,
      customerEmail,
      metadata,
      shippingAmount,
      taxAmount,
    } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided for checkout" },
        { status: 400 },
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "successUrl and cancelUrl are required" },
        { status: 400 },
      );
    }

    const lineItems = items.map((item: StripeCheckoutItem) => {
      const amountMinor = Math.max(
        0,
        Math.round(Number(item.amount ?? 0) * 100), // convert to smallest currency unit
      );

      return {
        price_data: {
          currency: (item.currency || "pkr").toLowerCase(),
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images || [],
          },
          unit_amount: amountMinor,
        },
        quantity: Math.max(1, item.quantity || 1),
      };
    });

    const shippingMinor = Math.max(
      0,
      Math.round(Number(shippingAmount ?? 0) * 100),
    );

    const taxMinor = Math.max(0, Math.round(Number(taxAmount ?? 0) * 100));

    if (shippingMinor > 0) {
      lineItems.push({
        price_data: {
          currency: lineItems[0]?.price_data.currency || "pkr",
          product_data: {
            name: "Shipping",
            description: "Shipping charges",
            images: [],
          },
          unit_amount: shippingMinor,
        },
        quantity: 1,
      });
    }

    if (taxMinor > 0) {
      lineItems.push({
        price_data: {
          currency: lineItems[0]?.price_data.currency || "pkr",
          product_data: {
            name: "Tax",
            description: "Tax charges",
            images: [],
          },
          unit_amount: taxMinor,
        },
        quantity: 1,
      });
    }

    const totalAmount = lineItems.reduce(
      (sum, li) => sum + (li.price_data.unit_amount || 0) * (li.quantity || 0),
      0,
    );

    if (totalAmount < 50) {
      return NextResponse.json(
        { error: "Order total must be at least 50 (smallest currency unit)." },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: metadata || {},
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["PK"] },
    });
console.log("session:",session?.url)
    return NextResponse.json({ success: true, url:session?.url });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error:", error.raw);
      return NextResponse.json(
        { error: error?.message || "Stripe error" },
        { status: 500 },
      );
    }

    console.error("Unknown error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
