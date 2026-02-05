import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { getStats } from "../controllers/statsController.js"

const statsRouter=express.Router()

statsRouter.get('/',protect,getStats)

export default statsRouter