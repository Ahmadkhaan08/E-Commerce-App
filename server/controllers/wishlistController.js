import asyncHandler from "express-async-handler";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// Add to  wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const product = await productModel.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const user = await userModel.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  //   check if the product already exists in the wishlisi
  if (user.wishlist && user.wishlist.includes(productId)) {
    res.status(400);
    throw new Error("Product already in wishlist");
  }
  //   Now add to the wishlist
    user.wishlist.push(productId);
await user.save();
res.json({
  success: true,
  wishlist: user.wishlist,
  message: "Product added to wishlist",
});
});

// Remove from wishlist
export const removeTowishlist=asyncHandler(async(req,res)=>{
    const {productId}=req.body
    if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

   const user = await userModel.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

//   Remove from the wishlist
  user.wishlist=user.wishlist.filter((id)=>id.toString()!==productId.toString())
  await user.save()
  res.json({
  success: true,
  wishlist: user.wishlist,
  message: "Product removed from wishlist",
});
})

// Get user's wishlist
export const getUserWishlist=asyncHandler(async(req,res)=>{
    const user=await userModel.findById(req.user._id).select("wishlist")
    if(user){
        res.json({
            success:true,
            wishlist:user.wishlist || []
        })
    }else{
        res.status(404)
        throw new Error("User not found!")
    }
})

// get wisdlist with products
export const getProductsWithWishlist=asyncHandler(async(req,res)=>{
    const {productIds}=req.body
    if(!productIds || !Array.isArray(productIds)){
        res.status(400);
    throw new Error("Product IDs array is required");
    }

    // fetching the products
    const products=await productModel.find({
        _id:{$in:productIds}
    }).populate("category","name")

    res.json({
        success:true,
        products
    })
})

// remove all wishlist
export const removeAllWishlist=asyncHandler(async(req,res)=>{
    const user=await userModel.findById(req.user._id)
    if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.wishlist=[]
  await user.save()
  res.json({
    success:true,
    wishlist:user.wishlist,
    message:"Wishlist removed Successfully!"
  })
})