import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { createOrderFromCart, deleteOrders, getAdminOrders, getAllOrders, getOrderById, updateOrder } from "../controllers/orderController.js"

const orderRouter=express.Router()

orderRouter.route('/').post(protect,createOrderFromCart).get(protect,getAllOrders)
orderRouter.route('/admin').get(protect,getAdminOrders)
orderRouter.route('/:id').get(protect,getOrderById).delete(protect,deleteOrders)
orderRouter.route('/:id/status').put(protect,updateOrder)
orderRouter.route('/:id/webhook-status').put(updateOrder)

export default orderRouter