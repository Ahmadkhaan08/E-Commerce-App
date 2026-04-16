import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const FREE_SHIPPING_THRESHOLD = 2000;
const BASE_SHIPPING_FEE = 250;
const TAX_RATE = 0.08;

// Create order from Cart
export const createOrderFromCart = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;
  // Validate that items are provided
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Cart items are required");
  }

  // Validate Shipping Address
  if (
    !shippingAddress ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.country ||
    !shippingAddress.postalCode
  ) {
    res.status(400);
    throw new Error(
      "Shipping address is required with all fields (street, city, country, postalCode)",
    );
  }

  // Validate each item structure
  const validateItems = items.map((item) => {
    if (!item._id || !item.name || !item.price || !item.quantity) {
      res.status(400);
      throw new Error("Invalid item structure");
    }

    const rawDiscount = Number(item.discountPercentage ?? 0);
    const discountPercentage = Number.isFinite(rawDiscount)
      ? Math.min(100, Math.max(0, rawDiscount))
      : 0;

    return {
      productId: item._id,
      name: item.name,
      price: Number(item.price),
      discountPercentage,
      quantity: item.quantity,
      image: item.image,
    };
  });

  // Calculate pricing breakdown.
  const subtotal = validateItems.reduce((acc, item) => {
    const effectiveUnitPrice = Math.max(
      Math.round(item.price - (item.price * item.discountPercentage) / 100),
      0,
    );
    return acc + effectiveUnitPrice * item.quantity;
  }, 0);

  const shippingFee = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_FEE;
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shippingFee + taxAmount;

  //   Create Order
  const order = await orderModel.create({
    userId: req.user._id,
    items: validateItems,
    subtotal,
    shippingFee,
    taxAmount,
    total: total,
    status: "pending",
    shippingAddress,
  });

  res.json({
    success: true,
    order,
    message: "Order Created Successfully!",
  });
});

const applyOrderStatusUpdate = async ({
  orderId,
  status,
  paymentIntentId,
  stripeSessionId,
  user,
}) => {
  const validateStatuses = ["pending", "paid", "completed", "cancelled"];

  if (!status || !validateStatuses.includes(status)) {
    throw new Error(
      "Invalid status. Must be one of: pending, paid, completed, cancelled",
    );
  }

  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  // Log order details for debugging
  console.log("Order before update:", {
    id: order._id,
    status: order.status,
    hasShippingAddress: !!order.shippingAddress,
    shippingAddress: order.shippingAddress,
  });

  // Check authorization based on order status and user role
  // - Users can only update their own orders when status is "pending"
  // - Admins can update any order at any time
  // - Webhook calls (no req.user) are always allowed
  if (user) {
    const isOwner = order.userId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";
    const isPending = order.status === "pending";

    // If user is not admin and (not owner OR order is not pending), deny access
    if (!isAdmin && (!isPending || !isOwner)) {
      throw new Error(
        isPending
          ? "Not authorized to update this order"
          : "Order status can only be updated by admin after payment",
      );
    }
  }

  // Prepare update object
  const updateData = {
    status,
    updatedAt: new Date(),
  };

  // If marking as paid, store payment information and timestamp
  if (status === "paid") {
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }
    if (stripeSessionId) {
      updateData.stripeSessionId = stripeSessionId;
    }
    updateData.paidAt = new Date();
  }

  // Use findByIdAndUpdate to avoid full document validation
  const updatedOrder = await orderModel.findByIdAndUpdate(
    orderId,
    updateData,
    {
      new: true,
      runValidators: false,
    },
  );

  return updatedOrder;
};

// update orders
export const updateOrder = asyncHandler(async (req, res) => {
  const { status, paymentIntentId, stripeSessionId } = req.body;

  let updatedOrder;
  try {
    updatedOrder = await applyOrderStatusUpdate({
      orderId: req.params.id,
      status,
      paymentIntentId,
      stripeSessionId,
      user: req.user,
    });
  } catch (error) {
    if (error.message === "Order not found") {
      res.status(404);
    } else if (
      error.message.includes("Invalid status") ||
      error.message.includes("Not authorized") ||
      error.message.includes("Order status can only")
    ) {
      res.status(error.message.includes("Invalid status") ? 400 : 403);
    }
    throw error;
  }

  res.json({
    success: true,
    order: updatedOrder,
    message: `Order status updated to ${status}`,
  });
});

export const updateOrderByOrderId = asyncHandler(async (req, res) => {
  const { orderId, status, paymentIntentId, stripeSessionId } = req.body;

  if (!orderId) {
    res.status(400);
    throw new Error("orderId is required");
  }

  let updatedOrder;
  try {
    updatedOrder = await applyOrderStatusUpdate({
      orderId,
      status,
      paymentIntentId,
      stripeSessionId,
      user: req.user,
    });
  } catch (error) {
    if (error.message === "Order not found") {
      res.status(404);
    } else if (
      error.message.includes("Invalid status") ||
      error.message.includes("Not authorized") ||
      error.message.includes("Order status can only")
    ) {
      res.status(error.message.includes("Invalid status") ? 400 : 403);
    }
    throw error;
  }

  res.json({
    success: true,
    order: updatedOrder,
    message: `Order status updated to ${status}`,
  });
});

// get all orders for user
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel
    .find({ userId: req.user._id })
    .populate("items.productId");

  if (orders) {
    res.json(orders);
  } else {
    res.status(404);
    throw new Error("Orders not found!");
  }
});

// get order by Id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderModel
    .findById(req.params.id)
    .populate("items.productId");

  if (
    order &&
    (req.user.role === "admin" ||
      order.userId.toString() === req.user._id.toString())
  ) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found!");
  }
});

// delete orders
export const deleteOrders = asyncHandler(async (req, res) => {
  const order = await orderModel.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found!");
  }

  if (
    req.user.role !== "admin" ||
    order.userId.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this order");
  }
  // Only allow deletion if order is still pending
  if (order.status !== "pending") {
    res.status(400);
    throw new Error("Cannot delete order that has been processed");
  }

  await orderModel.findByIdAndDelete(req.params.id);
  res.json({
    success: true,
    message: "Order deleted successfully",
  });
});

// get all orders for admin
export const getAdminOrders = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.min(100, Math.max(5, Number(req.query.perPage) || 20));
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const sortBy = ["createdAt", "total", "status"].includes(req.query.sortBy)
    ? req.query.sortBy
    : "createdAt";
  const status = (req.query.status || "").toLowerCase();
  const paymentStatus = (req.query.paymentStatus || "").toLowerCase();
  const search = (req.query.search || "").trim();
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const filter = {};

  let allowedStatuses = null;
  if (status && status !== "all") {
    allowedStatuses = [status];
  }

  if (paymentStatus && paymentStatus !== "all") {
    let paymentStatuses = null;
    if (paymentStatus === "paid") {
      paymentStatuses = ["paid", "completed"];
    } else if (paymentStatus === "pending") {
      paymentStatuses = ["pending", "processing"];
    } else if (paymentStatus === "failed") {
      paymentStatuses = ["cancelled"];
    }

    if (paymentStatuses) {
      if (allowedStatuses) {
        allowedStatuses = allowedStatuses.filter((entry) =>
          paymentStatuses.includes(entry),
        );
      } else {
        allowedStatuses = paymentStatuses;
      }
    }
  }

  if (allowedStatuses) {
    if (!allowedStatuses.length) {
      return res.json({
        orders: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        perPage,
      });
    }
    filter.status =
      allowedStatuses.length === 1
        ? allowedStatuses[0]
        : { $in: allowedStatuses };
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escaped, "i");

    const matchedUsers = await userModel
      .find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      })
      .select("_id")
      .lean();

    const userIds = matchedUsers.map((user) => user._id);
    const orFilters = [];

    if (userIds.length) {
      orFilters.push({ userId: { $in: userIds } });
    }

    if (mongoose.Types.ObjectId.isValid(search)) {
      orFilters.push({ _id: search });
    }

    if (!orFilters.length) {
      return res.json({
        orders: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        perPage,
      });
    }

    filter.$or = orFilters;
  }

  const skip = (page - 1) * perPage;

  const orders = await orderModel
    .find(filter)
    .populate("userId", "name email")
    .populate("items.productId", "name image price")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(perPage);

  const total = await orderModel.countDocuments(filter);
  const totalPages = Math.ceil(total / perPage);

  // Transform data to match frontend expectations
  const transformedOrders = orders.map((order) => ({
    _id: order._id,
    orderId: `ORD-${order._id.toString().slice(6).toUpperCase()}`,
    userId: {
      _id: order.userId?._id || null,
      name: order.userId?.name || "Unknown Customer",
      email: order.userId?.email || "unknown@example.com",
    },
    items: order.items.map((item) => ({
      product: {
        _id: item.productId?._id || null,
        name: item.productId?.name || item.name,
        image: item.productId?.image || item.image,
        price: item.productId?.price || item.price,
      },
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: order.total,
    status: order.status,
    paymentStatus:
      order.status === "paid" || order.status === "completed"
        ? "paid"
        : order.status === "cancelled"
          ? "failed"
          : "pending",
    shippingAddress: order.shippingAddress || {
      street: "N/A",
      city: "N/A",
      state: "N/A",
      zipCode: "N/A",
      country: "N/A",
    },
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }));

  res.json({
    orders: transformedOrders,
    total,
    totalPages,
    currentPage: page,
    perPage,
  });
});
