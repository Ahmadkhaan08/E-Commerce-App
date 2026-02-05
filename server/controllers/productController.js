import asyncHandler from "express-async-handler";
import productModel from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";

// Create Products
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discountPercentage,
    image,
    stock,
    category,
    brand,
  } = req.body;
  const productExists = await productModel.findOne({ name });
  if (productExists) {
    res.status(400);
    throw new Error("Product with this name already exists");
  }

  // Upload image to Cloudinary
  let imageUrl = undefined;
  if (image) {
    const result = await cloudinary.uploader.upload(image, {
      folder: "admin-dashboard/products",
    });
    imageUrl = result.secure_url;
  }

  const product = await productModel.create({
    name,
    description,
    price,
    discountPercentage: discountPercentage || 0,
    image: imageUrl,
    stock: stock || 0,
    category,
    brand,
  });
  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error("Invalid product data");
  }
});

// get all products
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortOrder = "asc",
    category,
    brand,
    priceMin,
    priceMax,
    search,
  } = req.query;
  const pageNumber=parseInt(page)
  const limitNumber=parseInt(limit)
  if(pageNumber<1 || limitNumber<1){
    res.status(400);
    throw new Error("Page and limit must be positive integers");
  }
  if(!["asc","desc"].includes(sortOrder)){
    res.status(400);
    throw new Error('Sort order must be "asc" or "desc"');
  }

  // Build query
  const  query={}
  if(category) query.category=category
  if(brand) query.brand=brand
  if(priceMin || priceMax){
    query.price={}
    if(priceMin) req.query.$gte=Number(priceMin)
    if(priceMax) req.query.$gte===Infinity?Number.MAX_SAFE_INTEGER:Number(priceMax)
  }
if(search){
  req.name={$regex:search,$options:"i"}
}

const skip=(pageNumber-1)*limitNumber
const sortValue=sortOrder==="asc"?1:-1
const [products,total]=await Promise.all([
  productModel.find(query).populate("category", "name")
    .populate("brand", "name").skip(skip).limit(limitNumber).sort({createdAt:sortValue}),
    productModel.countDocuments(query)

])

res.json({
products,
    total,
})
  // const product = await productModel.find({});
  // if (product) {
  //   res.json(product);
  // } else {
  //   res.status(404);
  //   throw new Error("Product not found!");
  // }
});

// get product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await productModel
    .findById(req.params.id)
    .populate("category", "name")
    .populate("brand", "name");
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found!");
  }
});

// Update Products
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discountPercentage,
    image,
    stock,
    category,
    brand,
  } = req.body;
  const product = await productModel.findById(req.params.id);

  if(product){

  if (name !== product.name) {
    const productExists = await productModel.findOne({ name });
    if (productExists) {
      res.status(400);
      throw new Error("Product with this name already exists");
    }
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.category = category || product.category;
  product.brand = brand || product.brand;
  product.discountPercentage = discountPercentage || product.discountPercentage;
  product.stock = stock || product.stock;

  if(image && image!==product.image){
    const result = await cloudinary.uploader.upload(image, {
      folder: "admin-dashboard/products",
    });
    product.image = result.secure_url;
  }
  const updatedProduct=await product.save()
  res.json(updatedProduct)
  }
    else {
    res.status(404);
    throw new Error("Product not found");
  }

});

// Delete Products
export const deleteProduct=asyncHandler(async(req,res)=>{
  const product=await productModel.findById(req.params.id)
  if(product){
    await product.deleteOne()
    res.json("Product Removed!")
  }else{
    res.status(404);
    throw new Error("Product not found");
  }
})

// Rate Product
export const rateProduct=asyncHandler(async(req,res)=>{
  const {rating}=req.body
  const product=await productModel.findById(req.params.id)
  if(product){
    const alreadyRated=product.ratings.find((r)=>r.userId.toString()===req.user._id.toString())

    if(alreadyRated){
      alreadyRated.rating=rating
    }else{
      product.ratings.push({
        userId:req.user._id,
        rating
      })
    }
    await product.save()
    res.json(product)
  }else{
res.status(404);
    throw new Error("Product not found");

  }
})
