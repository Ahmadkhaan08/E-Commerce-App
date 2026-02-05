import express from "express"
import { admin, protect } from "../middleware/authMiddleware.js"
import { getAnalyticsOverview, getInventoryAlerts, getProductAnalytics, getSalesAnalytics } from "../controllers/analyticsController.js"

const analyticsRouter=express.Router()

analyticsRouter.use(protect)
analyticsRouter.use(admin)

analyticsRouter.get("/overview",getAnalyticsOverview)
analyticsRouter.route('/products').get(getProductAnalytics)
analyticsRouter.route('/sales').get(getSalesAnalytics)
analyticsRouter.route('/inventory-alerts').get(getInventoryAlerts)
export default analyticsRouter