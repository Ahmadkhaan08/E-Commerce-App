import asyncHandler from "express-async-handler";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

// Get analytics overview
export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  try {
    const totalProducts = await productModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();
    const totalUsers = await userModel.countDocuments();

    // get total revenu
    const revenueAggregation = await orderModel.aggregate([
      { $match: { status: { $in: ["Paid", "Completed"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    // Get low stock products (stock < 10)
    const lowStockProducts = await productModel
      .find({ stock: { $lt: 10, $gt: 0 } })
      .select("name stock price images")
      .limit(10);
    // Get out of stock products
    const outOfStockProducts = await productModel
      .find({ stock: 0 })
      .select("name stock price images")
      .limit(10);
    // Get best selling products (based on order frequency)
    const bestSellingProducts = await orderModel.aggregate([
      { $match: { status: { $in: ["Paid", "Completed"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          productName: { $first: "$items.name" },
          productImage: { $first: "$items.image" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Get recent orders
    const recentOrders = await orderModel
      .find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("total status createdAt userId items");

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await orderModel.aggregate([
      {
        $match: {
          status: { $in: ["Paid", "Completed"] },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get order status breakdown
    const orderStatusBreakDown = await orderModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue,
        },
        inventory: {
          lowStockProducts,
          outOfStockProducts,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
        },
        sales: {
          bestSellingProducts,
          recentOrders,
          monthlyRevenue,
          orderStatusBreakDown,
        },
      },
    });
  } catch (error) {
    console.error("ANALYTICS ERROR 👉", error);
    res.status(500).json({
      message:error.message
    });
    throw new Error("Failed to fetch analytics data");
  }
});

// Get product analytics
export const getProductAnalytics = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "totalSold",
      sortOrder = "desc",
    } = req.query;
    const skip = (page - 1) * limit;
    // Get detailed product analytics
    const productAnalytics = await orderModel.aggregate([
      { $match: { status: { $in: ["Paid", "Completed"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
          averagePrice: { $avg: "$items.price" },
          orderCount: { $sum: 1 },
          productName: { $first: "$items.name" },
          productImage: { $first: "$items.image" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $addFields: {
          currentStock: { $arrayElemAt: ["$productDetails.stock",0] },
          category: { $arrayElemAt: ["$productDetails.category",0] },
          brand: { $arrayElemAt: ["$productDetails.brand",0] },
        },
      },
      { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
    ]);

    // Get total count for pagination
    const totalCount = await orderModel.aggregate([
      { $match: { status: { $in: ["Paid", "Completed"] } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId" } },
      { $count: "total" },
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        products: productAnalytics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message:error.message
    });;
    throw new Error("Failed to fetch product analytics");
  }
});

// Get Inventory Alerts
export const getInventoryAlerts = asyncHandler(async (req, res) => {
  try {
    const { treshold = 10 } = req.query;
    // Low stock products
    const lowStockProducts = await productModel
      .find({ stock: { $lte: parseInt(treshold), $gt: 0 } })
      .select("name stock price images category brand createdAt");

    // Out of stock products
    const outOfStockProducts = await productModel
      .find({ stock: 0 })
      .select("name stock price images category brand createdAt");

    // Products that haven't been updated in a while (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleProducts = await productModel
      .find({updatedAt:{ $lt: thirtyDaysAgo }})
      .select("name stock price images category brand updatedAt");

    // Products with no sales in the last 30 days
    const soldProductIds = await productModel.aggregate([
      {
        $match: {
          status: { $in: ["Paid", "Completed"] },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId" } },
    ]);
    const soldIds = soldProductIds.filter((item) => item._id);
    const notsoldProductIds = await productModel
      .find({ _id: { $nin: soldIds } })
      .select("name stock price images category brand createdAt")
      .limit(20);

    res.json({
      success: true,
      data: {
        lowStockProducts,
        outOfStockProducts,
        staleProducts,
        notsoldProductIds,
        counts: {
          lowStock: lowStockProducts.length,
          outOfStock: outOfStockProducts.length,
          staleProducts: staleProducts.length,
          noSales: notsoldProductIds.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message:error.message
    });;
    throw new Error("Failed to fetch inventory alerts");
  }
});

// get sales analytics
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  try {
    const { period = "monthly", year = new Date().getFullYear() } = req.query;

    let matchStage = {
      status: { $in: ["Paid", "Completed"] },
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    };

    let groupStage;
    if (period === "daily") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$total" },
      };
    } else if (period === "weekly") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$total" },
      };
    } else {
      // monthly
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$total" },
      };
    }

    const salesData = await orderModel.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    // Get top customers
    const topCustomers = await orderModel.aggregate([
      { $match: { status: { $in: ["Paid", "Completed"] } } },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$total" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $addFields: {
          customerName: { $arrayElemAt: ["$customer.name", 0] },
          customerEmail: { $arrayElemAt: ["$customer.email", 0] },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        topCustomers,
        period,
        year: parseInt(year),
      },
    });
  } catch (error) {
    res.status(500).json({
      message:error.message
    });
    throw new Error("Failed to fetch sales analytics");
  }
});
