import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type {
  AdminOrder,
  OrderPaymentStatus,
  RawOrderStatus,
} from "@/lib/type";
import authStore from "@/store/useAuthStore";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type UiOrderStatus = "pending" | "completed" | "canceled" | "delivered";
type SortBy = "date" | "total" | "status";
type SortOrder = "asc" | "desc";

const STATUS_OPTIONS: UiOrderStatus[] = [
  "pending",
  "completed",
  "canceled",
  "delivered",
];

const PAYMENT_OPTIONS: Array<OrderPaymentStatus | "all"> = [
  "all",
  "paid",
  "pending",
  "failed",
];

const PER_PAGE_OPTIONS = [10, 20, 30, 50];
const TAX_RATE = 0.08; // 8% tax
const SHIPPING_RATE = 250; // 250 shipping

const Orders = () => {
  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = authStore();
  const isAdmin = checkIsAdmin();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UiOrderStatus | "all">(
    "all",
  );
  const [paymentFilter, setPaymentFilter] = useState<
    OrderPaymentStatus | "all"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    order: AdminOrder;
    nextStatus: UiOrderStatus;
  } | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  const formatDate = (value: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-PK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizeUiStatus = (status: RawOrderStatus): UiOrderStatus => {
    if (status === "completed") return "delivered";
    if (status === "paid") return "completed";
    if (status === "cancelled") return "canceled";
    return "pending";
  };

  const toApiStatus = (status: UiOrderStatus): RawOrderStatus => {
    switch (status) {
      case "completed":
        return "paid";
      case "canceled":
        return "cancelled";
      case "delivered":
        return "completed";
      default:
        return "pending";
    }
  };

  const getApiStatus = (status: UiOrderStatus | "all") => {
    if (status === "all") return undefined;
    return toApiStatus(status);
  };

  const getApiSortBy = (value: SortBy) => {
    if (value === "total") return "total";
    if (value === "status") return "status";
    return "createdAt";
  };

  const getPaymentBadgeClass = (status: OrderPaymentStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getOrderBadgeClass = (status: UiOrderStatus) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "canceled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusLabel = (status: UiOrderStatus) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "canceled":
        return "Canceled";
      case "delivered":
        return "Delivered";
      default:
        return "Pending";
    }
  };

  const getPaymentLabel = (status: OrderPaymentStatus) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
      return error.response?.data?.message || fallback;
    }
    return fallback;
  };

  const fetchOrders = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await axiosPrivate.get("/orders/admin", {
        params: {
          page,
          perPage,
          sortOrder,
          sortBy: getApiSortBy(sortBy),
          status: getApiStatus(statusFilter),
          paymentStatus: paymentFilter === "all" ? undefined : paymentFilter,
          search: debouncedSearch || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });

      setOrders(response?.data?.orders || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(Math.max(1, response?.data?.totalPages || 1));

      if (!showLoader) {
        toast.success("Orders refreshed");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load orders"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchOrders(false);
  };

  const handleOpenDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const askStatusUpdateConfirmation = (
    order: AdminOrder,
    nextStatus: UiOrderStatus,
  ) => {
    setPendingStatusUpdate({ order, nextStatus });
    setIsConfirmOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!pendingStatusUpdate) return;

    setUpdatingStatus(true);
    try {
      const apiStatus = toApiStatus(pendingStatusUpdate.nextStatus);
      await axiosPrivate.put(
        `/orders/${pendingStatusUpdate.order._id}/status`,
        {
          status: apiStatus,
        },
      );

      setIsConfirmOpen(false);
      setPendingStatusUpdate(null);
      toast.success(
        `Order marked as ${getStatusLabel(pendingStatusUpdate.nextStatus)}`,
      );
      await fetchOrders(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update order status"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const exportAsCsv = () => {
    if (!orders.length) {
      toast.error("No orders available to export");
      return;
    }

    const rows = orders.map((order) => {
      const uiStatus = normalizeUiStatus(order.status);
      return {
        orderId: order.orderId,
        customerName: order.userId?.name || "N/A",
        email: order.userId?.email || "N/A",
        paymentStatus: getPaymentLabel(order.paymentStatus),
        orderStatus: getStatusLabel(uiStatus),
        totalAmount:
          order.totalAmount + TAX_RATE * order.totalAmount + SHIPPING_RATE,
        orderDate: new Date(order.createdAt).toISOString(),
      };
    });

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = String(
              row[header as keyof (typeof rows)[number]] ?? "",
            );
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-page-${page}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Current page exported as CSV");
  };

  const getAvailableTransitions = (order: AdminOrder): UiOrderStatus[] => {
    const current = normalizeUiStatus(order.status);
    if (current === "canceled" || current === "delivered") return [];
    return STATUS_OPTIONS.filter((status) => status !== current);
  };

  const hasData = orders.length > 0;
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    statusFilter,
    paymentFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    perPage,
  ]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders(true);
  }, [
    isAdmin,
    page,
    perPage,
    debouncedSearch,
    statusFilter,
    paymentFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  if (!isAdmin) {
    return (
      <div className="p-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              Admin access required
            </CardTitle>
            <CardDescription>
              You are not authorized to view or manage orders.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Orders Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage customer orders with reliable pagination and
            filtering.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
          <Button variant="outline" onClick={exportAsCsv} disabled={!hasData}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">{total}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
      >
        <Card className="py-4 bg-white border-gray-200">
          <CardContent className="px-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total Orders
            </p>
            <p className="text-2xl font-bold mt-1">{total}</p>
          </CardContent>
        </Card>
        <Card className="py-4 bg-white border-gray-200">
          <CardContent className="px-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Current Page
            </p>
            <p className="text-2xl font-bold mt-1">{page}</p>
          </CardContent>
        </Card>
        <Card className="py-4 bg-white border-gray-200">
          <CardContent className="px-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Rows Per Page
            </p>
            <p className="text-2xl font-bold mt-1">{perPage}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        <Card className="py-4 bg-white border-gray-200 shadow-sm mt-4" >
          <CardHeader className="px-4 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search customer or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as UiOrderStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={paymentFilter}
                onValueChange={(value) =>
                  setPaymentFilter(value as OrderPaymentStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "all"
                        ? "All Payments"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortBy)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="total">Sort by Total</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as SortOrder)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(perPage)}
                onValueChange={(value) => setPerPage(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rows per page" />
                </SelectTrigger>
                <SelectContent>
                  {PER_PAGE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-36" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <TableHead key={idx}>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : !hasData ? (
        <Card className="bg-white  border-gray-200 shadow-sm mt-4">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No orders found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing filters, search, or date range.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.25 }}
          >
            <Card className="py-0 overflow-hidden bg-white border-gray-200 shadow-sm mt-4">
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const uiStatus = normalizeUiStatus(order.status);
                      const transitions = getAvailableTransitions(order);
                      return (
                        <TableRow key={order._id}>
                          <TableCell className="font-semibold ">
                            {order.orderId.slice(0,12)+"...."}
                          </TableCell>
                          <TableCell>{order.userId?.name || "N/A"}</TableCell>
                          {/* <TableCell className="text-muted-foreground">{order.userId?.email || "N/A"}</TableCell> */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getPaymentBadgeClass(order.paymentStatus)} border`}
                            >
                              {getPaymentLabel(order.paymentStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getOrderBadgeClass(uiStatus)} border`}
                            >
                              {getStatusLabel(uiStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-700">
                            {formatCurrency(
                              order.totalAmount +
                                TAX_RATE * order.totalAmount +
                                SHIPPING_RATE,
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenDetails(order)}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                              <Select
                                onValueChange={(value) =>
                                  askStatusUpdateConfirmation(
                                    order,
                                    value as UiOrderStatus,
                                  )
                                }
                              >
                                <SelectTrigger className="w-[136px]">
                                  <SelectValue placeholder="Update" />
                                </SelectTrigger>
                                <SelectContent>
                                  {transitions.length ? (
                                    transitions.map((nextStatus) => (
                                      <SelectItem
                                        key={nextStatus}
                                        value={nextStatus}
                                      >
                                        {getStatusLabel(nextStatus)}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="none" disabled>
                                      No actions
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 p-3 md:hidden">
                {orders.map((order) => {
                  const uiStatus = normalizeUiStatus(order.status);
                  const transitions = getAvailableTransitions(order);
                  return (
                    <div
                      key={order._id}
                      className="rounded-lg border p-3 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.userId?.name || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.userId?.email || "N/A"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getOrderBadgeClass(uiStatus)} border`}
                        >
                          {getStatusLabel(uiStatus)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Payment</span>
                        <Badge
                          variant="outline"
                          className={`${getPaymentBadgeClass(order.paymentStatus)} border`}
                        >
                          {getPaymentLabel(order.paymentStatus)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold text-emerald-700">
                          {formatCurrency(
                            order.totalAmount +
                              TAX_RATE * order.totalAmount +
                              SHIPPING_RATE,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenDetails(order)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Select
                          onValueChange={(value) =>
                            askStatusUpdateConfirmation(
                              order,
                              value as UiOrderStatus,
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Update" />
                          </SelectTrigger>
                          <SelectContent>
                            {transitions.length ? (
                              transitions.map((nextStatus) => (
                                <SelectItem key={nextStatus} value={nextStatus}>
                                  {getStatusLabel(nextStatus)}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No actions
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.25 }}
          >
            <Card className="py-4 bg-white border-gray-200 shadow-sm mt-4">
              <CardContent className="px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">{from}</span>-
                  <span className="font-semibold text-foreground">{to}</span> of{" "}
                  <span className="font-semibold text-foreground">{total}</span>
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1 || loading}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground px-2">
                    Page{" "}
                    <span className="font-semibold text-foreground">
                      {page}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={page >= totalPages || loading}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[820px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete order, customer, payment, and shipping information.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-md border p-3 space-y-1">
                  <p className="font-semibold">Order Info</p>
                  <p>Order ID: {selectedOrder.orderId}</p>
                  <p>Date: {formatDate(selectedOrder.createdAt)}</p>
                  <p>Updated: {formatDate(selectedOrder.updatedAt)}</p>
                  <p>
                    Status:{" "}
                    <Badge
                      variant="outline"
                      className={`${getOrderBadgeClass(normalizeUiStatus(selectedOrder.status))} border`}
                    >
                      {getStatusLabel(normalizeUiStatus(selectedOrder.status))}
                    </Badge>
                  </p>
                </div>

                <div className="rounded-md border p-3 space-y-1">
                  <p className="font-semibold">Customer & Payment</p>
                  <p>Name: {selectedOrder.userId?.name || "N/A"}</p>
                  <p>Email: {selectedOrder.userId?.email || "N/A"}</p>
                  <p>
                    Payment:{" "}
                    <Badge
                      variant="outline"
                      className={`${getPaymentBadgeClass(selectedOrder.paymentStatus)} border`}
                    >
                      {getPaymentLabel(selectedOrder.paymentStatus)}
                    </Badge>
                  </p>
                  <p>
                    Payment Intent: {selectedOrder.paymentIntentId || "N/A"}
                  </p>
                  <p>
                    Stripe Session: {selectedOrder.stripeSessionId || "N/A"}
                  </p>
                </div>
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <p className="font-semibold">Shipping Address</p>
                <p>
                  {selectedOrder.shippingAddress?.street || "N/A"},{" "}
                  {selectedOrder.shippingAddress?.city || "N/A"},{" "}
                  {selectedOrder.shippingAddress?.state || "N/A"},{" "}
                  {selectedOrder.shippingAddress?.postalCode ||
                    selectedOrder.shippingAddress?.zipCode ||
                    "N/A"}
                  , {selectedOrder.shippingAddress?.country || "N/A"}
                </p>
              </div>

              <div className="rounded-md border p-3 space-y-3">
                <p className="font-semibold">Items</p>
                {selectedOrder.items?.length ? (
                  <>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={`${item.product?._id || index}-${index}`}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="flex items-center gap-2">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product?.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted" />
                            )}
                            <div>
                              <p className="font-medium">
                                {item.product?.name || "Product"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} x{" "}
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 font-semibold">
                            <p className="font-semibold">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}

                      <div className="flex  flex-col items-end font-semibold gap-1 rounded-md border p-2">
                        <p>
                          Tax:{" "}
                          {formatCurrency(TAX_RATE * selectedOrder.totalAmount)}
                        </p>
                        <p>Shipping: {formatCurrency(SHIPPING_RATE)}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No items found</p>
                )}
              </div>

              <div className="flex justify-end">
                <p className="text-base font-bold text-emerald-700">
                  Total:{" "}
                  {formatCurrency(
                    selectedOrder.totalAmount +
                      SHIPPING_RATE +
                      TAX_RATE * selectedOrder.totalAmount,
                  )}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm status update</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusUpdate
                ? `Are you sure you want to mark ${pendingStatusUpdate.order.orderId} as ${getStatusLabel(pendingStatusUpdate.nextStatus)}?`
                : "Are you sure you want to update this order?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingStatus}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleUpdateStatus();
              }}
              disabled={updatingStatus}
            >
              {updatingStatus ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;
