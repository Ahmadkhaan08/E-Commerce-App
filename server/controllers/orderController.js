import asyncHandler from "express-async-handler";
import orderModel from "../models/orderModel.js";

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
    return {
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    };
  });

  //   Calculate Total
  const total = validateItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  //   Create Order
  const order = await orderModel.create({
    userId: req.user._id,
    items: validateItems,
    total: total,
    status: "Pending",
    shippingAddress,
  });

  res.json({
    success: true,
    order,
    message: "Order Created Successfully!",
  });
});

// update orders
export const updateOrder = asyncHandler(async (req, res) => {
  const { status, paymentIntentId, stripeSessionId } = req.body;
  const validateStatuses = ["Pending", "Paid", "Completed", "Cancelled"];

  if (!status || !validateStatuses.includes(status)) {
    res.status(400);
    throw new Error(
      "Invalid status. Must be one of: pending, paid, completed, cancelled",
    );
  }

  const order = await orderModel.findById(req.params.id);
  if (!order) {
    res.status(404);
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
  if(req.user){
    const isOwner=order.userId.toString()===req.user._id.toString()
    const isAdmin=req.user.role==="admin"
    const isPending=order.status==="Pending"

    // If user is not admin and (not owner OR order is not pending), deny access
    if(!isAdmin && (!isPending || !isOwner)){
       res.status(403);
      throw new Error(
        isPending
          ? "Not authorized to update this order"
          : "Order status can only be updated by admin after payment"
      );
    }
  }

  // Prepare update object
  const updateData={
    status,updatedAt:new Date()
  }

  // If marking as paid, store payment information and timestamp
  if(status==="Paid"){
    if(paymentIntentId){
      updateData.paymentIntentId=paymentIntentId
    }
    if(stripeSessionId){
      updateData.stripeSessionId=stripeSessionId
    }
    updateData.paidAt=new Date()
  }

  // Use findByIdAndUpdate to avoid full document validation
  const updatedOrder=await orderModel.findByIdAndUpdate(req.params.id,updateData,{
    new:true,
    runValidators:false
  })

  res.json({
    success:true,
    order:updatedOrder,
    message:`Order status updated to ${status}`
  })
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
  if (order.status !== "Pending") {
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
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 20;
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
  const status = req.query.status;
  const paymentStatus = req.query.paymentStatus;
  // Build filter object
  const filter = {};
  if (status && status === "all") {
    filter.status = status;
  }

  if (paymentStatus && paymentStatus === "all") {
    if (paymentStatus === "Paid") {
      filter.status = { $in: ["Paid", "Completed"] };
    } else if (paymentStatus === "Pending") {
      filter.status = "Pending";
    } else if (paymentStatus === "Failed") {
      filter.status = "Cancelled";
    }
  }

  const skip = (page - 1) * perPage;

  const orders = await orderModel
    .find(filter)
    .populate("userId", "name email")
    .populate("items.productId", "name image price")
    .sort({ createdAt: sortOrder })
    .skip(skip)
    .limit(perPage);

  const total = await orderModel.countDocuments(filter);
  const totalPages = Math.ceil(total / perPage);

  // Transform data to match frontend expectations
  const transformedOrders = orders.map((order) => ({
    _id: order._id,
    orderId: `ORD-${order._id.toString().slice(6).toUpperCase()}`,
    userId: {
      _id: order.userId._id,
      name: order.userId.name,
      email: order.userId.email,
    },
    items: order.items.map((item) => ({
      product: {
        _id: item.productId._id,
        name: item.productId.name,
        image: item.productId.image,
        price: item.productId.price,
      },
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: order.total,
    status: order.status,
    paymentStatus:
      order.status === "Paid" || order.status === "Completed"
        ? "Paid"
        : order.status === "Cancelled"
          ? "Failed"
          : "Pending",
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
  });
});
