import express from "express"
import { loginUser, registerUser, userLogout, userProfile } from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js"

const authRouter=express.Router()

authRouter.post('/register',registerUser)
authRouter.post('/login',loginUser)
authRouter.get('/profile',protect,userProfile)
authRouter.post('/logout',protect,userLogout)

export default authRouter