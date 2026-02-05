import asyncHandler from "express-async-handler";
import brandModel from "../models/brandModel.js";
import cloudinary from "../config/cloudinary.js";



//  Create Brand
export const createBrand=asyncHandler(async(req,res)=>{
    const {name,image}=req.body
    const brandExists=await brandModel.findOne({name})

    if(brandExists){
        res.status(400)
        throw new Error("Brand Already Exists!")
    }

    // image store in cloudinary
    let imageUrl=""
    if(image){
        const result=await cloudinary.uploader.upload(image,({
            folder:'admin-dashboard/brands'
        }))
        imageUrl=result.secure_url
    }
    const brand=await brandModel.create({
        name,image:imageUrl || undefined
    })

    if(brand){
        res.status(200).json(brand)
    }else{
        res.status(400)
        throw new Error("Invalid brand data!")
    }
})

// Get all brands
export const getBrands=asyncHandler(async(req,res)=>{
    const brands=await brandModel.find({})
    if(brands){
        res.json(brands)
    }else{
        res.status(404)
        throw new Error("Brand not found!")
    }
})

// Get brand by ID
export const getBrandById=asyncHandler(async(req,res)=>{
    const brand=await brandModel.findById(req.params.id)

    if(brand){
        res.status(200).json(brand)
    }else{
        res.status(404)
        throw new Error("Brand does not exists!")
    }

})

// update brand
export const updateBrand=asyncHandler(async(req,res)=>{
    const {name,image}=req.body
    const brand=await brandModel.findById(req.params.id)

    if(brand){
        brand.name=name || brand.name
        if(image!==undefined){
            if(image){
                const result=await cloudinary.uploader.upload(image,({
                    folder:"admin-dashboard/brands"
                }))
                brand.image=result.secure_url
            }else{
                brand.image=undefined
            }
        }
        const updatedBrand=await brand.save()
        res.status(200).json(updatedBrand)
    }else{
        res.status(404)
        throw new Error("Brand does not exists!")
    }

})

// delete brand
export const deleteBrand=asyncHandler(async(req,res)=>{
    const brand=await brandModel.findById(req.params.id)
    if(brand){
        await brand.deleteOne()
        res.json({message:"Brand Removed!"})
    }else{
        res.status(404)
        throw new Error("Brand does not exists!")
    }
})