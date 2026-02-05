import asyncHandler from "express-async-handler";
import categoryModel from "../models/categoryModel.js";
import cloudinary from "../config/cloudinary.js";

// Create Category
export const createCategories=asyncHandler(async(req,res)=>{
    const {name,image, categoryType}=req.body
    if(!name || typeof name!=="string"){
        res.status(400);
        throw new Error("Category name is required and must be a string");
    }
    const validateCategoryType=["Featured", "Hot Categories", "Top Categories"]
    if(!validateCategoryType.includes(categoryType)){
        res.status(400);
        throw new Error("Invalid category type");
    }
    const categoryExists=await categoryModel.findOne({name})
    if(categoryExists){
         res.status(400);
         throw new Error("Category already exists");
    }
    let imageUrl=""
    if(image){
        const result=await cloudinary.uploader.upload(image,({
            folder:"admin-dashboard/categories"
        }))
        imageUrl=result.secure_url
    }

    const category=await categoryModel.create({
        name,
        image:imageUrl || undefined,
        categoryType
    })
     if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
})

// Update Category
export const updateCategory=asyncHandler(async(req,res)=>{
    const {name,image, categoryType}=req.body

    const validateCategoryType=["Featured", "Hot Categories", "Top Categories"]
    if(categoryType && !validateCategoryType.includes(categoryType)){
        res.status(400);
        throw new Error("Invalid category type");
    }

    const category=await categoryModel.findById(req.params.id)
    if(category){
        category.name=name || category.name
        category.categoryType=categoryType || category.categoryType

        if(image!==undefined){
             if(image){
        const result=await cloudinary.uploader.upload(image,({
            folder:"admin-dashboard/categories"
        }))
        imageUrl=result.secure_url
    }
        }else{
            imageUrl=undefined
        }
        const updatedCategory=await category.save()
        if(updatedCategory){
            res.json(updatedCategory)
        }else{
            res.status(400);
            throw new Error("Invalid category data");
        }
    }else{
            res.status(404);
        throw new Error("Category not found!");
    }

})

// Delete Category
export const deleteCategory=asyncHandler(async(req,res)=>{
    const category=await categoryModel.findById(req.params.id)

    if(category){
        await category.deleteOne()
        res.json("Category Removed!")
    }else{
        res.status(404);
        throw new Error("Category not found!");
    }
})

// Get Category by ID
export const getCategoryById=asyncHandler(async(req,res)=>{
        const category=await categoryModel.findById(req.params.id)

        if(category){
            res.json(category)
        }else{
            res.status(404);
            throw new Error("Category not found!");
        }
})

// Get All Categories
export const getCategories=asyncHandler(async(req,res)=>{
    const page=parseInt(req.query.page) || 1
    const perPage=parseInt(req.query.perPage) || 20
    const sortOrder=req.query.sortOrder || "asc"

    if(page <1 || perPage <1){
        res.status(400);
    throw new Error("Page and perPage must be positive integers");
    }

    if(!["asc","desc"].includes(sortOrder)){
        res.status(400);
    throw new Error('Sort order must be "asc" or "desc"');
    }

    const skip=(page-1)*perPage
    const total=await categoryModel.countDocuments({})
    const sortValue=sortOrder==="asc"?1:-1
    const category=await categoryModel.find({}).skip(skip).limit(perPage).sort({createdAt:sortValue})

    const totalPages=Math.ceil(total/perPage)
    res.json({category,total,page,perPage,totalPages})
})
