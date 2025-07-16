import { createServer } from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Cleaned: bodyParser removed since express.json handles parsing
import rateLimit from "express-rate-limit";

import { registerRoutes } from "./routes.js";
import { initializeTickers } from "./init-tickers.js";
import { startNotificationProcessor } from "./services/scheduledProcessor.js";
import { securityMiddleware } from "./middleware/security.js";
import { dataValidationMiddleware } from "./middleware/dataValidation.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
        frameSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:"],
        workerSrc: ["'self'", "blob:"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["*"]
        : [
            "https://crypto-kings-frontend.vercel.app",
            "http://localhost:3000",
            "http://localhost:5000",
            "http://localhost:5173",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Security & validation middleware
app.use(securityMiddleware);
app.use(dataValidationMiddleware);

// Only log warnings for missing services in development
if (process.env.NODE_ENV === "development") {
  console.log("⚠️ SMS Service not configured - missing Twilio credentials");
  console.log("⚠️ Telegram Service not configured - missing bot token");
}

// HTTP server
const server = createServer(app);

// Async initialization wrapped in IIFE
(async () => {
  try {
    // Register WebSocket routes
    await registerRoutes(app);

    // Initialize crypto tickers and services
    await initializeTickers();
    console.log("✅ Cryptocurrency tickers initialized successfully");

    // Start background processors
    startNotificationProcessor();

    // Start the server
    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Backend API server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Error during server startup:", error);
  }
})();
