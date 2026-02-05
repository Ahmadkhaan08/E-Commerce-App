import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { addItemToCart, clearCart, getCart, removeItemFromCart, updateItemToCart } from "../controllers/cartController.js"

const cartRouter=express.Router()

cartRouter.use(protect)

cartRouter.route('/').get(getCart).post(addItemToCart).delete(clearCart)
cartRouter.route('/update').put(updateItemToCart)
cartRouter.route('/:productId').delete(removeItemFromCart)


export default cartRouter