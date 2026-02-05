import express from "express"
import { admin, protect } from "../middleware/authMiddleware.js"
import { createBanner, deleteBanner, getBannerById, getBanners, updateBanner } from "../controllers/bannerController.js"

const bannerRouter=express.Router()

bannerRouter.route("/").post(protect,admin,createBanner).get(getBanners)
bannerRouter.route("/:id").get(protect,getBannerById).put(protect,admin,updateBanner).delete(protect,admin,deleteBanner)

export default bannerRouter