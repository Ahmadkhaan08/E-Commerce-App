import asyncHandler from "express-async-handler";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// Add item to cart
export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const product = await productModel.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found!");
  }

  const user = await userModel.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  //   check if the item exists in cart or not
  const existsItem = user.cart.findIndex(
    (item) => item.productId.toString() === productId,
  );
  if (existsItem > -1) {
    user.cart[existsItem].quantity += parseInt(quantity);
  } else {
    user.cart.push({
      productId,
      quantity: parseInt(quantity),
    });
  }

  await user.save();
  // Populate the cart for response
  await user.populate({
    path: "cart.productId",
    model: "Product",
  });

  // Filter out any cart items with null/deleted products
  const validCartItems = user.cart.filter((item) => item.productId);

  res.json({
    success: true,
    cart: validCartItems,
    message: "Item added to cart successfully",
  });
});

// Update items in the cart
export const updateItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (quantity < 0) {
    res.status(400);
    throw new Error("Quantity cannot be negative");
  }

  const user = await userModel.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  const itemIndex = user.cart.findIndex(
    (item) => item.productId.toString() === productId,
  );
  if (itemIndex > -1) {
    if (quantity === 0) {
      // Remove item if quantity is 0
      user.cart.splice(itemIndex, 1);
    } else {
      user.cart[itemIndex].quantity = parseInt(quantity);
    }

    await user.save();

    await user.populate({
      path: "cart.productId",
      model: "Product",
    });

    const validCartItems = user.cart.filter((item) => item.productId);

    res.json({
      success: true,
      cart: validCartItems,
      message: "Item added to cart successfully",
    });
  } else {
    res.status(404);
    throw new Error("Item not found in cart");
  }
});

// Delete Item from Cart
export const removeItemFromCart = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const user = await userModel.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  const itemIndex = user.cart.findIndex(
    (item) => item.productId.toString() === productId,
  );

  if (itemIndex > -1) {
    user.cart.splice(itemIndex, 1);

    await user.save();
    // Populate the cart for response
    await user.populate({
      path: "cart.productId",
      model: "Product",
    });

    // Filter out any cart items with null/deleted products
    const validCartItems = user.cart.filter((item) => item.productId);

    res.json({
      success: true,
      cart: validCartItems,
      message: "Item removed from cart successfully",
    });
  } else {
    res.status(404);
    throw new Error("Item not found in cart");
  }
});

// Clear All Items from the Cart
export const clearCart = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  user.cart = [];
  await user.save();
  res.json({
    success: true,
    cart: [],
    message: "Cart cleared successfully",
  });
});

// get Cart items
export const getCart = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id).populate({
    path: "cart.productId",
    model: "Product",
  });
  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

    // Filter out any cart items with null/deleted products
  const validCartItems = user.cart.filter((item) => item.productId);
  res.json({
    success: true,
    cart: validCartItems,
    message: "Cart retrieved successfully",
  });
});
