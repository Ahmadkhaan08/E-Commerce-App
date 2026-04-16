import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { confirmStripePayment, createStripeSession } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-session", protect, createStripeSession);
paymentRouter.post("/confirm", protect, confirmStripePayment);

export default paymentRouter;
