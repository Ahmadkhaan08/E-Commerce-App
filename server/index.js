import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorMiddleware.js";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import brandRouter from "./routes/brandRoutes.js";
import bannerRouter from "./routes/bannerRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import productRouter from "./routes/productRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import emailRouter from "./routes/emailRoutes.js";
import statsRouter from "./routes/statsRoute.js";
import orderRouter from "./routes/orderRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB()

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  "https://babymart-sigma.vercel.app",
  "https://babymartadmin.vercel.app",
  "https://babymartclient.vercel.app",
  // Add production URLs

  // Add localhost for development
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081", // iOS simulator
  "http://10.0.2.2:8081", // Android emulator
  "http://10.0.2.2:8000", // Android emulator direct access
  // "http://192.168.1.100:8081", // Replace with your actual local IP for physical devices
].filter(Boolean); // Remove any undefined values

const allowedOriginPatterns = [/^https:\/\/babymart-.*\.vercel\.app$/i];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    const isAllowedByPattern = allowedOriginPatterns.some((pattern) =>
      pattern.test(origin),
    );

    if (allowedOrigins.includes(origin) || isAllowedByPattern) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Increase body size limit for JSON and URL-encoded payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Debug middleware for order routes

// Routes
app.use('/api/auth',authRouter)
app.use('/api/users',userRouter)
app.use('/api/brands',brandRouter)
app.use('/api/banners',bannerRouter)
app.use('/api/categories',categoryRouter)
app.use('/api/products',productRouter)
app.use('/api/wishlist',wishlistRouter)
app.use('/api/orders',orderRouter)
app.use('/api/carts',cartRouter)
app.use('/api/email',emailRouter)
app.use('/api/analytics',analyticsRouter)
app.use('/api/stats',statsRouter)

// API Documentation

// Home route
app.get("/", (req, res) => {
  res.send({messsage:'Hello from the server!'})
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}!`);
});
