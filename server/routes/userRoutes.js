import express from "express"
import { admin, protect } from "../middleware/authMiddleware.js"
import { createUser, getUserById, getUsers, updateUser,deleteUser, addAddress, updateAddress, deleteAddress } from "../controllers/userController.js"

const userRouter=express.Router()

userRouter.route("/").get(protect,admin,getUsers).post(protect,admin,createUser)
userRouter.route("/:id").get(protect,getUserById).put(protect,updateUser).delete(protect,admin,deleteUser)
userRouter.route('/:id/address').post(protect,addAddress)
userRouter.route('/:id/address/:addressId').put(protect,updateAddress).delete(protect,deleteAddress)
export default userRouter