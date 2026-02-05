import express from 'express';
import { admin, protect } from '../middleware/authMiddleware.js';
import { createProduct, deleteProduct, getProductById, getProducts, rateProduct, updateProduct } from '../controllers/productController.js';

const productRouter=express.Router();

productRouter.route('/').post(protect,admin,createProduct).get(getProducts)
productRouter.route("/:id").get(protect,getProductById).put(protect,admin,updateProduct).delete(protect,admin,deleteProduct)
productRouter.route('/:id/rate').post(protect,rateProduct)
export default productRouter;