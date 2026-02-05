import express from "express"
import { admin, protect } from "../middleware/authMiddleware.js"
import { sendGeneralEmail, testEmailConfig } from "../controllers/emailController.js"
 

const emailRouter=express.Router()

emailRouter.use(protect)
emailRouter.use(admin)
emailRouter.get("/test",testEmailConfig)
emailRouter.post("/send",sendGeneralEmail)

export default emailRouter