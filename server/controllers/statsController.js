import asyncHandler from "express-async-handler";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import brandModel from "../models/brandModel.js";
import orderModel from "../models/orderModel.js";

export const getStats = asyncHandler(async (req, res) => {
  const userCounts = await userModel.countDocuments();
  const productCounts = await productModel.countDocuments();
  const categoryCounts = await categoryModel.countDocuments();
  const brandCounts = await brandModel.countDocuments();
  const orderCounts = await orderModel.countDocuments();

  // Get total revenue from orders that are paid/settled.
  // We prefer paidAt because older records can have inconsistent status labels.
  const revenueData = await orderModel.aggregate([
    {
      $match: {
        total: { $gt: 0 },
        $or: [
          { paidAt: { $exists: true, $ne: null } },
          { status: { $in: ["Paid", "Completed"] } },
        ],
      },
    },
    { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
  ]);
  const totalRevenue = Number(revenueData[0]?.totalRevenue || 0);

  // Get user roles distribution
  const roles = await userModel.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get category distribution
  const categoryData = await productModel.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
     { $unwind: "$categoryInfo" },
  {
    $group: {
      _id: "$categoryInfo.name",
      count: { $sum: 1 },
    },
  },
    
  ]);

  // Get category distribution
  const brandData = await productModel.aggregate([
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brandInfo",
      },
    },
     { $unwind: "$brandInfo" },
  {
    $group: {
      _id: "$brandInfo.name",
      count: { $sum: 1 },
    },
  },
  ]);

  res.json({
    counts: {
      users: userCounts,
      products: productCounts,
      categories: categoryCounts,
      brands: brandCounts,
      orders: orderCounts,
      totalRevenue: totalRevenue,
    },
    roles: roles.map((role) => ({
      name: role._id,
      value: role.count,
    })),
    categories: categoryData.map((category) => ({
      name: category._id,
      value: category.count,
    })),
    brands: brandData.map((brand) => ({
      name: brand._id,
      value: brand.count,
    })),
  });
});
