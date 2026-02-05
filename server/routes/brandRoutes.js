import express from "express"
import { admin, protect } from "../middleware/authMiddleware.js"
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from "../controllers/brandController.js"

const brandRouter=express.Router()


brandRouter.route('/').post(protect,admin,createBrand).get(protect,getBrands)
brandRouter.route('/:id').get(getBrandById).put(protect,admin,updateBrand).delete(protect,admin,deleteBrand)

export default brandRouter