import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { addToWishlist, getProductsWithWishlist, getUserWishlist, removeAllWishlist, removeTowishlist } from "../controllers/wishlistController.js"

const wishlistRouter=express.Router()

wishlistRouter.route('/add').post(protect,addToWishlist)
wishlistRouter.route('/remove').delete(protect,removeTowishlist)
wishlistRouter.route('/').get(protect,getUserWishlist)
wishlistRouter.route('/get-products').post(protect,getProductsWithWishlist)
wishlistRouter.route('/remove-all').delete(protect,removeAllWishlist)

export default wishlistRouter