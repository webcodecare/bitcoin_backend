import express from "express";
import { registerRoutes } from "./routes.js";
import { config } from "./config.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();
const port = config.port;

// Security middleware
app.use(helmet({
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
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const corsOrigins = config.corsOrigin 
  ? config.corsOrigin.split(',').map(origin => origin.trim())
  : config.nodeEnv === 'production' 
    ? ['*'] // Allow all origins for API-only deployment
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Trust proxy for deployment environments
app.set('trust proxy', 1);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 1000, // Increased limit for API usage
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/health';
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  try {
    console.log('🚀 Starting backend server...');
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Database URL: ${config.databaseUrl ? 'Configured' : 'Not configured'}`);
    console.log(`🔐 JWT Secret: ${config.jwtSecret ? 'Configured' : 'Not configured'}`);

    // Register all routes
    const httpServer = await registerRoutes(app);

    // Start the server
    httpServer.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🌐 Health check: http://localhost:${port}/api/health`);
      console.log(`📡 WebSocket: ws://localhost:${port}/ws`);
      console.log(`🔧 CORS Origins: ${corsOrigins.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();