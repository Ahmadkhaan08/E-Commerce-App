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
import type { AdminOrder, OrderPaymentStatus } from "@/lib/type";
import authStore from "@/store/useAuthStore";
import { AxiosError } from "axios";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

type SortBy = "date" | "amount" | "status";
type SortOrder = "asc" | "desc";
type PaymentFilter = OrderPaymentStatus | "all";
type UpdatablePaymentStatus = "paid" | "pending" | "failed";

interface InvoiceDetails {
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    postalCode?: string;
    country: string;
  };
  paymentIntentId?: string;
  stripeSessionId?: string;
  paidAt?: string;
  createdAt: string;
  status: string;
}

const TAX_RATE = 0.08;
const SHIPPING_FEE = 250;
const PER_PAGE_OPTIONS = [10, 20, 30, 50];

const Invoices = () => {
  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = authStore();
  const isAdmin = checkIsAdmin();

  const [invoices, setInvoices] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedInvoice, setSelectedInvoice] = useState<AdminOrder | null>(
    null,
  );
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
      return error.response?.data?.message || fallback;
    }
    return fallback;
  };

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

  const formatAddress = (address: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    postalCode?: string;
    country: string;
  }) => {
    if (!address) return "N/A";
    return [
      address.street,
      address.city,
      address.state,
      address.zipCode || address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getInvoiceId = (invoice: AdminOrder) =>
    `INV-${invoice._id.toString().slice(-8).toUpperCase()}`;

  const getApiSortBy = (value: SortBy) => {
    if (value === "amount") return "total";
    if (value === "status") return "status";
    return "createdAt";
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

  const getApiStatusFromPaymentStatus = (status: UpdatablePaymentStatus) => {
    switch (status) {
      case "paid":
        return "paid";
      case "failed":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const getSubtotal = (
    invoice: AdminOrder,
    details?: InvoiceDetails | null,
  ) => {
    if (details?.items?.length) {
      return details.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    }
    return invoice.totalAmount || 0;
  };

  const getTotals = (invoice: AdminOrder, details?: InvoiceDetails | null) => {
    const subtotal = getSubtotal(invoice, details);
    const tax = subtotal * TAX_RATE;
    const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
    const totalAmount = subtotal + tax + shipping;
    return { subtotal, tax, shipping, totalAmount };
  };

  const buildInvoiceHtml = (
    invoice: AdminOrder,
    details: InvoiceDetails | null,
  ) => {
    const baseDetails = details || {
      orderId: invoice.orderId,
      items: invoice.items.map((item) => ({
        name: item.product?.name || "Item",
        quantity: item.quantity,
        price: item.price,
        image: item.product?.image,
      })),
      shippingAddress: invoice.shippingAddress,
      createdAt: invoice.createdAt,
      status: invoice.status,
    };

    const invoiceId = getInvoiceId(invoice);
    const customerName = invoice.userId?.name || "Unknown Customer";
    const customerEmail = invoice.userId?.email || "N/A";
    const { subtotal, tax, shipping, totalAmount } = getTotals(
      invoice,
      details,
    );
    const transactionId =
      baseDetails.paymentIntentId || baseDetails.stripeSessionId || "N/A";
    const paymentMethod = transactionId === "N/A" ? "N/A" : "Stripe";

    const itemsHtml = baseDetails.items
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">${formatCurrency(item.price)}</td>
            <td style="text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
          </tr>
        `,
      )
      .join("");

    return `
      <html>
        <head>
          <title>Invoice ${invoiceId}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 700; margin: 0; }
            .meta, .box p { margin: 4px 0; font-size: 12px; color: #334155; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .box { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
            .box h4 { margin: 0 0 8px 0; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: .02em; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 12px; }
            th { background: #f8fafc; text-align: left; color: #334155; }
            .totals { margin-left: auto; width: 320px; margin-top: 16px; }
            .row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 13px; }
            .row.total { font-weight: 700; font-size: 16px; border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">Invoice</h1>
              <p class="meta">Invoice ID: ${invoiceId}</p>
              <p class="meta">Order ID: ${baseDetails.orderId || invoice.orderId}</p>
            </div>
            <div>
              <p class="meta">Issued: ${formatDate(baseDetails.createdAt || invoice.createdAt)}</p>
              <p class="meta">Payment: ${getPaymentLabel(invoice.paymentStatus)}</p>
              <p class="meta">Transaction: ${transactionId}</p>
            </div>
          </div>

          <div class="grid">
            <div class="box">
              <h4>Billed To</h4>
              <p>${customerName}</p>
              <p>${customerEmail}</p>
            </div>
            <div class="box">
              <h4>Shipping Address</h4>
              <p>${formatAddress(baseDetails.shippingAddress)}</p>
              <h4 style="margin-top: 12px;">Payment Method</h4>
              <p>${paymentMethod}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Unit Price</th>
                <th style="text-align:right;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
            <div class="row"><span>Tax (${Math.round(TAX_RATE * 100)}%)</span><span>${formatCurrency(tax)}</span></div>
            <div class="row"><span>Shipping</span><span>${formatCurrency(shipping)}</span></div>
            <div class="row total"><span>Total</span><span>${formatCurrency(totalAmount)}</span></div>
          </div>
        </body>
      </html>
    `;
  };

  const openPrintWindow = (title: string, html: string) => {
    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) {
      toast.error("Popup blocked. Please allow popups for this site.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.document.title = title;
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const fetchInvoices = async (showLoader = true) => {
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
          paymentStatus: paymentFilter === "all" ? undefined : paymentFilter,
          search: debouncedSearch || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });

      setInvoices(response?.data?.orders || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(Math.max(1, response?.data?.totalPages || 1));

      if (!showLoader) {
        toast.success("Invoices refreshed");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load invoices"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchInvoiceDetails = async (invoice: AdminOrder) => {
    setLoadingDetails(true);
    setInvoiceDetails(null);
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);

    try {
      const response = await axiosPrivate.get(`/orders/${invoice._id}`);
      const data = response?.data;

      setInvoiceDetails({
        orderId: invoice.orderId,
        items: (data?.items || []).map(
          (item: {
            name?: string;
            quantity: number;
            price: number;
            image?: string;
            productId?: { name?: string; image?: string };
          }) => ({
            name: item?.productId?.name || item?.name || "Item",
            quantity: item?.quantity || 0,
            price: item?.price || 0,
            image: item?.productId?.image || item?.image,
          }),
        ),
        shippingAddress: data?.shippingAddress || invoice.shippingAddress,
        paymentIntentId: data?.paymentIntentId,
        stripeSessionId: data?.stripeSessionId,
        paidAt: data?.paidAt,
        createdAt: data?.createdAt || invoice.createdAt,
        status: data?.status || invoice.status,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load invoice details"));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRefresh = async () => {
    await fetchInvoices(false);
  };

  const handleUpdatePaymentStatus = async (
    invoice: AdminOrder,
    nextStatus: UpdatablePaymentStatus,
  ) => {
    setUpdatingStatusId(invoice._id);
    try {
      await axiosPrivate.put(`/orders/${invoice._id}/status`, {
        status: getApiStatusFromPaymentStatus(nextStatus),
      });

      const label = nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1);
      toast.success(`Payment status changed to ${label}`);
      await fetchInvoices(true);

      if (selectedInvoice?._id === invoice._id) {
        await fetchInvoiceDetails(invoice);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update payment status"));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const exportCsv = () => {
    if (!invoices.length) {
      toast.error("No invoices available to export");
      return;
    }

    const rows = invoices.map((invoice) => {
      const totals = getTotals(invoice);
      return {
        invoiceId: getInvoiceId(invoice),
        orderId: invoice.orderId,
        customerName: invoice.userId?.name || "N/A",
        customerEmail: invoice.userId?.email || "N/A",
        paymentStatus: getPaymentLabel(invoice.paymentStatus),
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.totalAmount,
        invoiceDate: new Date(invoice.createdAt).toISOString(),
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
    link.download = `invoices-page-${page}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Invoices exported as CSV");
  };

  const exportPdfSummary = () => {
    if (!invoices.length) {
      toast.error("No invoices available to export");
      return;
    }

    setExporting(true);
    try {
      const rows = invoices
        .map((invoice) => {
          const totals = getTotals(invoice);
          return `
            <tr>
              <td>${getInvoiceId(invoice)}</td>
              <td>${invoice.orderId}</td>
              <td>${invoice.userId?.name || "N/A"}</td>
              <td>${getPaymentLabel(invoice.paymentStatus)}</td>
              <td style="text-align:right;">${formatCurrency(totals.totalAmount)}</td>
              <td>${formatDate(invoice.createdAt)}</td>
            </tr>
          `;
        })
        .join("");

      const html = `
        <html>
          <head>
            <title>Invoices Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
              h1 { margin-bottom: 4px; }
              p { margin-top: 0; color: #475569; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 12px; }
              th { background: #f8fafc; text-align: left; }
            </style>
          </head>
          <body>
            <h1>Invoices Report</h1>
            <p>Generated on ${new Date().toLocaleString("en-PK")}</p>
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th style="text-align:right;">Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      openPrintWindow("Invoices Report", html);
      toast.success("Report opened. Use Save as PDF in print dialog.");
    } finally {
      setExporting(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!selectedInvoice) return;
    const html = buildInvoiceHtml(selectedInvoice, invoiceDetails);
    openPrintWindow(`Invoice ${getInvoiceId(selectedInvoice)}`, html);
  };

  const handleDownloadInvoicePdf = () => {
    if (!selectedInvoice) return;
    const html = buildInvoiceHtml(selectedInvoice, invoiceDetails);
    openPrintWindow(`Invoice ${getInvoiceId(selectedInvoice)}`, html);
    toast.success("Invoice opened. Use Save as PDF in print dialog.");
  };

  const handleCopyInvoiceId = async (invoice: AdminOrder) => {
    const invoiceId = getInvoiceId(invoice);
    try {
      await navigator.clipboard.writeText(invoiceId);
      toast.success("Invoice ID copied");
    } catch {
      toast.error("Failed to copy invoice ID");
    }
  };

  const filteredInvoices = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return invoices;

    return invoices.filter((invoice) => {
      const invoiceId = getInvoiceId(invoice).toLowerCase();
      const orderId = (invoice.orderId || "").toLowerCase();
      const customerName = (invoice.userId?.name || "").toLowerCase();
      return (
        invoiceId.includes(term) ||
        orderId.includes(term) ||
        customerName.includes(term)
      );
    });
  }, [invoices, debouncedSearch]);

  console.log(
    filteredInvoices.map((i) => ({
      id: i._id,
      status: i.status,
    })),
  );
  const stats = useMemo(() => {
    const paidInvoices = filteredInvoices.filter(
      (invoice) =>
        invoice.paymentStatus?.toLowerCase() === "paid" 
    );

    const totalRevenue = paidInvoices.reduce((sum, invoice) => {
      return sum + getTotals(invoice).totalAmount;
    }, 0);
    const paid = filteredInvoices.filter(
      (invoice) => invoice.paymentStatus === "paid",
    ).length;
    const pending = filteredInvoices.filter(
      (invoice) => invoice.paymentStatus === "pending",
    ).length;
    const failed = filteredInvoices.filter(
      (invoice) => invoice.paymentStatus === "failed",
    ).length;

    return { totalRevenue, paid, pending, failed };
  }, [filteredInvoices]);

  const hasData = filteredInvoices.length > 0;
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
    paymentFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    perPage,
  ]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchInvoices(true);
  }, [
    isAdmin,
    page,
    perPage,
    debouncedSearch,
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
              You are not authorized to view or manage invoices.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full payment visibility, downloadable invoice documents, and status
            management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="hover:bg-indigo-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={exportPdfSummary}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Preparing..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="py-4">
          <CardContent className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total Revenue
            </p>
            <p className="text-2xl font-semibold">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">
              From current filtered page
            </p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Paid Invoices
            </p>
            <p className="text-2xl font-semibold text-green-600">
              {stats.paid}
            </p>
            <p className="text-xs text-muted-foreground">Settled payments</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Pending Invoices
            </p>
            <p className="text-2xl font-semibold text-amber-600">
              {stats.pending}
            </p>
            <p className="text-xs text-muted-foreground">Need follow-up</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Failed Invoices
            </p>
            <p className="text-2xl font-semibold text-red-600">
              {stats.failed}
            </p>
            <p className="text-xs text-muted-foreground">
              Payment attempts failed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="py-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Search and Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-2">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer, invoice ID, or order ID"
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <Select
              value={paymentFilter}
              onValueChange={(value: PaymentFilter) => setPaymentFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payment statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={sortBy}
              onValueChange={(value: SortBy) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value: SortOrder) => setSortOrder(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={String(perPage)}
              onValueChange={(value) => setPerPage(Number(value))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearch("");
                setPaymentFilter("all");
                setStartDate("");
                setEndDate("");
                setSortBy("date");
                setSortOrder("desc");
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : !hasData ? (
          <div className="p-10 text-center space-y-2">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-lg">No invoices found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting filters or search terms to find relevant invoices.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice, index) => {
                    const totals = getTotals(invoice);
                    return (
                      <TableRow
                        key={invoice._id}
                        className={index % 2 ? "bg-muted/10" : "bg-background"}
                      >
                        <TableCell className="font-medium whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{getInvoiceId(invoice)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyInvoiceId(invoice)}
                              title="Copy invoice ID"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/dashboard/orders?order=${invoice._id}`}
                            className="text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            {(invoice.orderId || "").slice(0, 8).toUpperCase() +
                              "....."}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {invoice.userId?.name || "Unknown Customer"}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 whitespace-nowrap">
                          {formatCurrency(totals.totalAmount)}
                        </TableCell>
                        <TableCell className="text-center  whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={getPaymentBadgeClass(
                              invoice.paymentStatus,
                            )}
                          >
                            {getPaymentLabel(invoice.paymentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(invoice.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end items-center gap-2">
                            <Select
                              value={invoice.paymentStatus}
                              onValueChange={(value: UpdatablePaymentStatus) =>
                                handleUpdatePaymentStatus(invoice, value)
                              }
                              disabled={updatingStatusId === invoice._id}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchInvoiceDetails(invoice)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden p-4 space-y-3">
              {filteredInvoices.map((invoice) => {
                const totals = getTotals(invoice);
                return (
                  <Card key={invoice._id} className="py-4 gap-4">
                    <CardContent className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Invoice ID
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {getInvoiceId(invoice)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyInvoiceId(invoice)}
                              title="Copy invoice ID"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={getPaymentBadgeClass(
                            invoice.paymentStatus,
                          )}
                        >
                          {getPaymentLabel(invoice.paymentStatus)}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Order:</span>{" "}
                          <Link
                            to={`/dashboard/orders?order=${invoice._id}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {invoice.orderId}
                          </Link>
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Customer:
                          </span>{" "}
                          {invoice.userId?.name || "Unknown Customer"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Amount:</span>{" "}
                          <span className="font-semibold text-green-600">
                            {formatCurrency(totals.totalAmount)}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Date:</span>{" "}
                          {formatDate(invoice.createdAt)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={invoice.paymentStatus}
                          onValueChange={(value: UpdatablePaymentStatus) =>
                            handleUpdatePaymentStatus(invoice, value)
                          }
                          disabled={updatingStatusId === invoice._id}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchInvoiceDetails(invoice)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t px-4 py-3 bg-muted/10">
              <p className="text-sm text-muted-foreground">
                Showing {from}-{to} of {total} invoices
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <p className="text-sm font-medium min-w-[88px] text-center">
                  Page {page} / {totalPages}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page >= totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 pr-8">
              <span>Invoice Details</span>
              {selectedInvoice && (
                <Badge
                  variant="outline"
                  className={getPaymentBadgeClass(
                    selectedInvoice.paymentStatus,
                  )}
                >
                  {getPaymentLabel(selectedInvoice.paymentStatus)}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Professional invoice breakdown including customer details, line
              items, and payment metadata.
            </DialogDescription>
          </DialogHeader>

          {!selectedInvoice || loadingDetails ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="py-4">
                  <CardContent className="space-y-1 text-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Invoice
                    </p>
                    <p>
                      <span className="font-medium">Invoice ID:</span>{" "}
                      {getInvoiceId(selectedInvoice)}
                    </p>
                    <p>
                      <span className="font-medium">Order ID:</span>{" "}
                      {selectedInvoice.orderId}
                    </p>
                    <p>
                      <span className="font-medium">Invoice Date:</span>{" "}
                      {formatDate(
                        invoiceDetails?.createdAt || selectedInvoice.createdAt,
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card className="py-4">
                  <CardContent className="space-y-1 text-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Customer Information
                    </p>
                    <p className="font-medium">
                      {selectedInvoice.userId?.name || "Unknown Customer"}
                    </p>
                    <p>{selectedInvoice.userId?.email || "N/A"}</p>
                    <p>
                      <span className="font-medium">Payment Method:</span>{" "}
                      {invoiceDetails?.paymentIntentId ||
                      invoiceDetails?.stripeSessionId
                        ? "Stripe"
                        : "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Transaction ID:</span>{" "}
                      {invoiceDetails?.paymentIntentId ||
                        invoiceDetails?.stripeSessionId ||
                        "N/A"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="py-4">
                  <CardContent className="space-y-1 text-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Billing Address
                    </p>
                    <p>
                      {formatAddress(
                        invoiceDetails?.shippingAddress ||
                          selectedInvoice.shippingAddress,
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card className="py-4">
                  <CardContent className="space-y-1 text-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Shipping Address
                    </p>
                    <p>
                      {formatAddress(
                        invoiceDetails?.shippingAddress ||
                          selectedInvoice.shippingAddress,
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="py-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20">
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(invoiceDetails?.items?.length
                        ? invoiceDetails.items
                        : selectedInvoice.items.map((item) => ({
                            name: item.product?.name || "Item",
                            quantity: item.quantity,
                            price: item.price,
                            image: item.product?.image,
                          }))
                      ).map((item, index) => (
                        <TableRow key={`${item.name}-${index}`}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              <Card className="py-4">
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(
                        getTotals(selectedInvoice, invoiceDetails).subtotal,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
                    <span>
                      {formatCurrency(
                        getTotals(selectedInvoice, invoiceDetails).tax,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>
                      {formatCurrency(
                        getTotals(selectedInvoice, invoiceDetails).shipping,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>
                      {formatCurrency(
                        getTotals(selectedInvoice, invoiceDetails).totalAmount,
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-end gap-2">
                <Select
                  value={selectedInvoice.paymentStatus}
                  onValueChange={(value: UpdatablePaymentStatus) =>
                    handleUpdatePaymentStatus(selectedInvoice, value)
                  }
                  disabled={updatingStatusId === selectedInvoice._id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={handlePrintInvoice}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button onClick={handleDownloadInvoicePdf}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice (PDF)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
