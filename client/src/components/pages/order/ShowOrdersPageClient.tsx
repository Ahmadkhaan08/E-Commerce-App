"use client";

import Container from "@/components/common/Container";
import PriceFormatter from "@/components/common/PriceFormatter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Order } from "@/lib/orderApi";
import { useOrderStore, useUserStore } from "@/lib/store";
import {
  Ban,
  Calendar,
  ChevronDown,
  ChevronUp,
  CircleDot,
  CreditCard,
  PackageSearch,
  Search,
  Truck,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type UiOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const TAX_RATE = 0.08;
const SHIPPING_FEE = 250;
const FREE_SHIPPING_THRESHOLD = 2000;
const ITEMS_PER_PAGE = 6;

const statusConfig: Record<
  UiOrderStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-950/40 dark:text-yellow-300",
    icon: <CircleDot className="h-3.5 w-3.5" />,
  },
  processing: {
    label: "Processing",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
    icon: <Truck className="h-3.5 w-3.5" />,
  },
  shipped: {
    label: "Shipped",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-300",
    icon: <Truck className="h-3.5 w-3.5" />,
  },
  delivered: {
    label: "Delivered",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: <Truck className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300",
    icon: <Ban className="h-3.5 w-3.5" />,
  },
};

const paidBadgeClassName =
  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300";

const timelineSteps: UiOrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeOrderStatus = (status: string): UiOrderStatus => {
  const normalized = status.toLowerCase();
  if (normalized === "cancelled") return "cancelled";
  if (normalized === "delivered" || normalized === "completed")
    return "delivered";
  if (normalized === "shipped") return "shipped";
  if (normalized === "processing" || normalized === "paid") return "processing";
  return "pending";
};

const isOrderPaid = (order: Order): boolean => {
  const normalized = order.status.toLowerCase();
  if (normalized === "paid" || normalized === "completed" || order.paidAt) {
    return true;
  }
  return false;
};

const getSubtotal = (order: Order) => {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const getShippingCharge = (subtotal: number) => {
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
};

const OrderDetailsPanel = ({ order }: { order: Order }) => {
  const uiStatus = normalizeOrderStatus(order.status);
  const subtotal = getSubtotal(order);
  const tax = subtotal * TAX_RATE;
  const shipping = getShippingCharge(subtotal);
  const finalTotal = subtotal + tax + shipping;
  const currentStepIndex = timelineSteps.indexOf(uiStatus);

  return (
    <div className="rounded-lg border bg-muted/20 p-4 md:p-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h4 className="text-sm font-semibold text-foreground">
            Purchased Items
          </h4>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={`${order._id}-${item.productId}`}
                className="flex items-center justify-between rounded-md border bg-background/70 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <PriceFormatter
                  amount={item.price * item.quantity}
                  className="text-sm"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-md border bg-background/70 p-3">
            <h5 className="text-sm font-semibold text-foreground">
              Order Timeline
            </h5>
            {uiStatus === "cancelled" ? (
              <p className="text-xs text-muted-foreground">
                This order has been cancelled and will not proceed to delivery.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {timelineSteps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  return (
                    <div
                      key={`${order._id}-timeline-${step}`}
                      className={cn(
                        "rounded-md border px-2 py-1.5 text-center text-xs font-medium transition-colors",
                        isActive
                          ? "border-primary/30 bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {statusConfig[step].label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-md border bg-background/70 p-3">
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Price Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Items price</span>
                <PriceFormatter amount={subtotal} className="text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <PriceFormatter amount={tax} className="text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <PriceFormatter amount={SHIPPING_FEE} className="text-sm" />
              </div>
              <div className="flex items-center justify-between border-t pt-2 text-base font-semibold text-foreground">
                <span>Total</span>
                <PriceFormatter amount={finalTotal} className="text-base" />
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-background/70 p-3 text-sm">
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Shipping Address
            </h4>
            <p className="text-muted-foreground">
              {order.shippingAddress.street}, {order.shippingAddress.city}
            </p>
            <p className="text-muted-foreground">
              {order.shippingAddress.country},{" "}
              {order.shippingAddress.postalCode}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="transition-all hover:-translate-y-0.5"
            >
              <Link href={`/user/checkout?orderId=${order._id}`}>
                View Full Details
              </Link>
            </Button>
            {normalizeOrderStatus(order.status) === "delivered" ? (
              <Button
                asChild
                size="sm"
                className="transition-all hover:-translate-y-0.5"
              >
                <Link href="/shop">Reorder</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersSkeleton = () => (
  <Container className="py-8">
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <Skeleton className="h-10 w-full md:w-72" />
          <Skeleton className="h-12 w-full md:w-[420px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={`order-skeleton-${idx}`} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  </Container>
);

const ShowOrdersPageClient = () => {
  const { auth_token, isAuthenticated } = useUserStore();
  const { orders, isLoading, loadOrders } = useOrderStore();

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (auth_token) {
      void loadOrders(auth_token);
    }
  }, [auth_token, loadOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const status = normalizeOrderStatus(order.status);
      const tabMatches =
        activeTab === "all" ||
        (activeTab === "pending" && status === "pending") ||
        (activeTab === "completed" && status === "delivered") ||
        (activeTab === "cancelled" && status === "cancelled");

      const searchMatches =
        query.length === 0 ||
        order._id.toLowerCase().includes(query) ||
        order._id.toLowerCase().slice(-8).includes(query);

      return tabMatches && searchMatches;
    });
  }, [activeTab, orders, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const pageOrders = filteredOrders.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (!isAuthenticated || !auth_token) {
    return (
      <Container className="py-8">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Sign in to view your orders</CardTitle>
            <CardDescription>
              Your order tracking history appears here once you are logged in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/auth/signin">Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Track every purchase, review item details, and manage completed
            orders.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by Order ID"
                  className="pl-9"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Showing {filteredOrders.length} order
                {filteredOrders.length === 1 ? "" : "s"}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList
                className="w-full justify-start overflow-x-auto"
                variant="default"
              >
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {filteredOrders.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-10 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <PackageSearch className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      No orders yet
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No orders match your filters. Try another tab or search
                      term.
                    </p>
                    <div className="mt-4">
                      <Button asChild variant="outline">
                        <Link href="/shop">Start Shopping</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pageOrders.map((order) => {
                            const uiStatus = normalizeOrderStatus(order.status);
                            const isPaid = isOrderPaid(order);
                            const isExpanded = expandedOrderId === order._id;

                            return (
                              <React.Fragment key={order._id}>
                                <TableRow className="transition-all hover:bg-muted/40">
                                  <TableCell className="font-medium">
                                    #{order._id.slice(-8)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <PriceFormatter
                                      amount={order.total || getSubtotal(order)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {isPaid ? (
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "capitalize",
                                          paidBadgeClassName,
                                        )}
                                      >
                                        <CreditCard className="h-3.5 w-3.5" />
                                        Paid
                                      </Badge>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "capitalize",
                                        statusConfig[uiStatus].className,
                                      )}
                                    >
                                      {statusConfig[uiStatus].icon}
                                      {statusConfig[uiStatus].label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setExpandedOrderId(
                                          isExpanded ? null : order._id,
                                        )
                                      }
                                      className="transition-all hover:bg-muted"
                                    >
                                      {isExpanded ? "Hide" : "View"}
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TableCell>
                                </TableRow>

                                {isExpanded ? (
                                  <TableRow>
                                    <TableCell colSpan={6} className="p-4">
                                      <OrderDetailsPanel order={order} />
                                    </TableCell>
                                  </TableRow>
                                ) : null}
                              </React.Fragment>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-3 md:hidden">
                      {pageOrders.map((order) => {
                        const uiStatus = normalizeOrderStatus(order.status);
                        const isPaid = isOrderPaid(order);
                        const isExpanded = expandedOrderId === order._id;

                        return (
                          <div
                            key={order._id}
                            className="rounded-xl border bg-background p-4 shadow-sm transition-all hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  #{order._id.slice(-8)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <PriceFormatter
                                amount={order.total || getSubtotal(order)}
                                className="text-sm"
                              />
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {isPaid ? (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "capitalize",
                                    paidBadgeClassName,
                                  )}
                                >
                                  Paid
                                </Badge>
                              ) : null}
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  statusConfig[uiStatus].className,
                                )}
                              >
                                {statusConfig[uiStatus].label}
                              </Badge>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setExpandedOrderId(
                                  isExpanded ? null : order._id,
                                )
                              }
                              className="mt-3 w-full justify-between"
                            >
                              <span>
                                {isExpanded ? "Hide details" : "View details"}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>

                            {isExpanded ? (
                              <div className="mt-3">
                                <OrderDetailsPanel order={order} />
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {totalPages > 1 ? (
                      <div className="mt-5 flex items-center justify-between gap-2 border-t pt-4">
                        <p className="text-xs text-muted-foreground md:text-sm">
                          {totalPages === safePage
                            ? `You have viewed all ${orders.length} orders`
                            : `Page ${safePage} of ${totalPages}`}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={safePage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1),
                              )
                            }
                            disabled={safePage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </Container>
  );
};

export default ShowOrdersPageClient;
