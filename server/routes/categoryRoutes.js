import express from "express"
import { admin, protect } from "../middleware/authMiddleware.js"
import { createCategories, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controllers/categoryController.js"

const categoryRouter=express.Router()

categoryRouter.route('/').post(protect,admin,createCategories).get(getCategories)
categoryRouter.route("/:id").put(protect,admin,updateCategory).get(protect,getCategoryById).delete(protect,admin,deleteCategory)

export default categoryRouter