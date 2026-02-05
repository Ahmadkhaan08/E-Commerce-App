import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";
import bannerModel from "../models/bannerModel.js";

//Create Banner
export const createBanner = asyncHandler(async (req, res) => {
  const { name, title, startFrom, image, bannerType } = req.body;
  const bannerExists = await bannerModel.findOne({ name });
  if (bannerExists) {
    res.status(400);
    throw new Error("Same banner already exists");
  }

  let imageUrl = "";
  if (image) {
    const result = await cloudinary.uploader.upload(image, {
      folder: "admin-dashboard/banners",
    });
    imageUrl = result.secure_url;
  }

  const banner = new bannerModel({
    name,
    title,
    startFrom,
    image: imageUrl || undefined,
    bannerType,
  });
  const createdBanner=await banner.save()
  if(createdBanner){
    res.status(201).json(banner)
  }else{
    res.status(400);
    throw new Error("Invalid banner data");
  }

});

// get all banners
export const getBanners=asyncHandler(async(req,res)=>{
    const banner=await bannerModel.find({})
    if(banner){
    res.status(200).json(banner)
  }else{
    res.status(404);
    throw new Error("Banner not found!");
  }
})

// get banners by Id
export const getBannerById=asyncHandler(async(req,res)=>{
    const banner=await bannerModel.findById(req.params.id)
     if (banner) {
    res.json(banner);
  }else{
   res.status(404);
    throw new Error("Banner not found!"); 
  }
})

// update banner
export const updateBanner=asyncHandler(async(req,res)=>{
  const { name, title, startFrom, image, bannerType } = req.body;
    const banner=await bannerModel.findById(req.params.id)

    if(banner){
        banner.name=name || banner.name
        banner.title=title || banner.title
        banner.startFrom=startFrom || banner.startFrom
        banner.bannerType=bannerType || banner.bannerType

        
        if(image!==undefined){
            let imageUrl = "";
  if (image) {
    const result = await cloudinary.uploader.upload(image, {
      folder: "admin-dashboard/banners",
    });
    imageUrl = result.secure_url;
  }
        }else{
            image=undefined
        }
        const updatedBanner=await banner.save()
        res.json(updatedBanner)
    }else{
        res.status(404);
        throw new Error("Banner not found!"); 
    }

})

export const deleteBanner=asyncHandler(async(req,res)=>{
    const banner=await bannerModel.findById(req.params.id)
     if (banner) {
    await banner.deleteOne();
    res.json({ message: "Banner removed" });
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
})
