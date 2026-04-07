"use client";

import PriceFormatter from "@/components/common/PriceFormatter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOrderById, updateOrderStatus } from "@/lib/orderApi";
import { useOrderStore, useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, CreditCard, Inbox, Receipt, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const SuccessPageClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { auth_token } = useUserStore();
  const { updateOrder } = useOrderStore();

  const [syncState, setSyncState] = useState<"idle" | "syncing" | "synced" | "already" | "failed">("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const orderIdFromQuery = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const paymentMethod = searchParams.get("method") || "Card";
  const amountParam = searchParams.get("amount");
  const email = searchParams.get("email") || null;

  const orderIdFromPath = useMemo(() => {
    if (!pathname) return null;
    const match = pathname.match(/success\/orderId=([^&?/]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  }, [pathname]);

  const orderId = orderIdFromQuery || orderIdFromPath;
  const amount = amountParam ? Number(amountParam) : null;

  useEffect(() => {
    let isCancelled = false;

    const markOrderAsPaid = async () => {
      if (!orderId || !auth_token) {
        return;
      }

      setSyncState("syncing");
      setSyncMessage("Finalizing your order payment status...");

      try {
        const currentOrder = await getOrderById(orderId, auth_token);

        if (!currentOrder) {
          throw new Error("Order not found while confirming payment.");
        }

        const normalizedStatus = currentOrder.status?.toLowerCase();
        if (
          normalizedStatus === "paid" ||
          normalizedStatus === "completed" ||
          Boolean(currentOrder.paidAt)
        ) {
          if (!isCancelled) {
            setSyncState("already");
            setSyncMessage("Order status is already marked as paid.");
          }
          return;
        }

        const result = await updateOrderStatus(
          orderId,
          "paid",
          auth_token,
          undefined,
          sessionId || undefined,
        );

        if (!result.success || !result.order) {
          throw new Error(result.message || "Failed to update order payment status.");
        }

        if (!isCancelled) {
          updateOrder(result.order);
          setSyncState("synced");
          setSyncMessage("Order status updated to paid.");
        }
      } catch (error) {
        if (!isCancelled) {
          setSyncState("failed");
          setSyncMessage(
            error instanceof Error
              ? error.message
              : "Payment succeeded, but order status sync is pending.",
          );
        }
      }
    };

    void markOrderAsPaid();

    return () => {
      isCancelled = true;
    };
  }, [orderId, auth_token, sessionId, updateOrder]);

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    [],
  );

  const receiptHint = email
    ? `A receipt has been sent to ${email}`
    : "A receipt has been emailed to you.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl space-y-6">
        <div className="text-center space-y-2">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Payment</Badge>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Payment Successful</h1>
          <p className="text-slate-600">Thank you for your purchase. Your payment has been processed securely.</p>
        </div>

        <Card className="shadow-xl border-slate-200/70 bg-white/90 backdrop-blur">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 className="h-7 w-7" aria-hidden />
                </div>
                <span className="absolute inset-0 rounded-full border border-emerald-100 animate-ping" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">Order confirmed</CardTitle>
                <p className="text-sm text-slate-600">Order ID {orderId || "—"}</p>
                {syncMessage && (
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      syncState === "failed" ? "text-amber-600" : "text-emerald-600",
                    )}
                  >
                    {syncMessage}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-slate-700 border-slate-200 bg-slate-50">
              Session {sessionId ? sessionId.slice(-6) : "Live"}
            </Badge>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Amount paid</p>
                    <div className="text-3xl font-semibold text-emerald-600 leading-tight flex items-baseline gap-2">
                      {amount ? (
                        <PriceFormatter amount={amount} className="text-3xl text-emerald-600" />
                      ) : (
                        <span className="text-slate-500 text-2xl">—</span>
                      )}
                      <Badge className="bg-emerald-100 text-emerald-700 border-none">Paid</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formattedDate}
                    </span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow
                    label="Payment method"
                    value={paymentMethod}
                    icon={<CreditCard className="h-4 w-4 text-emerald-600" />}
                  />
                  <DetailRow
                    label="Status"
                    value={syncState === "failed" ? "Sync pending" : "Succeeded"}
                    icon={<Shield className="h-4 w-4 text-emerald-600" />}
                  />
                  <DetailRow
                    label="Order ID"
                    value={orderId || "Pending"}
                    icon={<Receipt className="h-4 w-4 text-emerald-600" />}
                  />
                  <DetailRow
                    label="Receipt"
                    value={receiptHint}
                    icon={<Inbox className="h-4 w-4 text-emerald-600" />}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Next steps</h3>
                <div className="flex flex-col gap-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    Your order is being prepared. You will receive updates shortly.
                  </p>
                  <p className="flex items-center gap-2">
                    <Inbox className="h-4 w-4 text-emerald-600" />
                    Keep an eye on your inbox for the receipt and tracking details.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                <div className="mb-4 space-y-1">
                  <p className="text-sm text-emerald-700">Confirmation</p>
                  <h3 className="text-lg font-semibold text-emerald-900">You’re all set!</h3>
                  <p className="text-sm text-emerald-800">We’ve secured your payment and created your order.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={() => router.push("/shop")}
                  >
                    Go to Shop
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => router.push("/user/profile")}
                  >
                    View Order
                  </Button>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between text-xs text-emerald-800">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Secured by Stripe
                  </span>
                  <Link
                    href="/support"
                    className="text-emerald-700 hover:text-emerald-900 font-medium"
                  >
                    Need help?
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4 text-emerald-600" />
              Transactions are encrypted and protected.
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <Link href="/" className="hover:text-slate-900">Continue shopping</Link>
              <span className="hidden md:block text-slate-300">•</span>
              <Link href="/orders" className="hover:text-slate-900">Order history</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const DetailRow = ({ label, value, icon }: DetailRowProps) => (
  <div className="flex items-start gap-3 rounded-xl bg-white p-3 border border-slate-200">
    <div className="mt-0.5 text-emerald-600">{icon}</div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn("text-sm font-medium text-slate-900")}>{value}</p>
    </div>
  </div>
);

export default SuccessPageClient;