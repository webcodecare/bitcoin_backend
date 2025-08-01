import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { body, validationResult, param, query } from "express-validator";
import { createStorage, type IStorage } from "./storage.js";
import { insertUserSchema, insertSignalSchema, insertTickerSchema } from "../shared/schema.js";
import { z } from "zod";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Security utilities
function sanitizeInput(input: string): string {
  return input.replace(/[<>\"'&]/g, '');
}

function generateSecureToken(): string {
  return jwt.sign(
    { 
      id: Math.random().toString(36).substring(2),
      iat: Date.now()
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Input validation middleware
const validateInput = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array(),
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// SQL injection prevention
const validateUuid = param('id').isUUID().withMessage('Invalid ID format');
const validateEmail = body('email').isEmail().normalizeEmail().withMessage('Invalid email format');
const validatePassword = body('password')
  .isLength({ min: 6, max: 128 })
  .withMessage('Password must be between 6 and 128 characters');

// Initialize Stripe (optional for development)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
  });
  console.log('✅ Stripe initialized');
} else {
  console.log('⚠️  Stripe not configured - payment features disabled');
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize storage
  const storage = await createStorage();

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast to all connected clients
  function broadcast(message: any) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Enhanced authentication middleware with token validation
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          message: 'No token provided',
          code: 'NO_TOKEN',
          timestamp: new Date().toISOString()
        });
      }
      
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await storage.getUserById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Initialize cryptocurrency tickers
  async function initializeTickers() {
    console.log('Initializing cryptocurrency tickers...');
    
    const tickersToAdd = [
      { symbol: 'BTCUSDT', description: 'Bitcoin / Tether USD', category: 'major' },
      { symbol: 'ETHUSDT', description: 'Ethereum / Tether USD', category: 'major' },
      { symbol: 'BNBUSDT', description: 'Binance Coin / Tether USD', category: 'major' },
      { symbol: 'SOLUSDT', description: 'Solana / Tether USD', category: 'layer1' },
      { symbol: 'XRPUSDT', description: 'Ripple / Tether USD', category: 'major' },
      { symbol: 'ADAUSDT', description: 'Cardano / Tether USD', category: 'layer1' },
      { symbol: 'DOTUSDT', description: 'Polkadot / Tether USD', category: 'layer1' },
      { symbol: 'MATICUSDT', description: 'Polygon / Tether USD', category: 'layer1' },
      { symbol: 'AVAXUSDT', description: 'Avalanche / Tether USD', category: 'layer1' },
      { symbol: 'ATOMUSDT', description: 'Cosmos / Tether USD', category: 'layer1' },
    ];

    let addedCount = 0;
    const allTickers = await storage.getAllTickers();
    const existingSymbols = new Set(allTickers.map(t => t.symbol));

    for (const ticker of tickersToAdd) {
      if (!existingSymbols.has(ticker.symbol)) {
        try {
          await storage.createTicker({
            ...ticker,
            isEnabled: true
          });
          console.log(`Added: ${ticker.symbol} - ${ticker.description}`);
          addedCount++;
        } catch (error) {
          console.error(`Failed to add ${ticker.symbol}:`, error);
        }
      } else {
        console.log(`Skipped: ${ticker.symbol} (already exists)`);
      }
    }

    console.log('Initialization complete!');
    console.log(`Total tickers added: ${addedCount}`);
    console.log(`Total tickers in system: ${allTickers.length + addedCount}`);
  }

  // Initialize tickers on startup
  await initializeTickers();

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Public API Routes - No authentication required
  app.get('/api/public/tickers', async (req, res) => {
    try {
      const tickers = await storage.getEnabledTickers();
      res.json(tickers);
    } catch (error) {
      console.error('Error fetching tickers:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/public/market/price/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Simple price simulation for demonstration
      const basePrice = symbol === 'BTCUSDT' ? 117000 : 
                       symbol === 'ETHUSDT' ? 3200 :
                       symbol === 'SOLUSDT' ? 140 : 1000;
      
      const randomVariation = (Math.random() - 0.5) * 100;
      const price = basePrice + randomVariation;
      
      res.json({ 
        symbol, 
        price: parseFloat(price.toFixed(2)),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching price:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/public/signals/alerts', async (req, res) => {
    try {
      const { ticker, timeframe } = req.query;
      const signals = await storage.getSignalsByTicker(ticker as string, timeframe as string);
      res.json(signals);
    } catch (error) {
      console.error('Error fetching signals:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/public/ohlc', async (req, res) => {
    try {
      const { symbol, interval, limit } = req.query;
      
      // Simple OHLC data simulation
      const data = [];
      const basePrice = 117000;
      const startTime = Date.now() - (parseInt(limit as string) || 100) * 7 * 24 * 60 * 60 * 1000;
      
      for (let i = 0; i < (parseInt(limit as string) || 100); i++) {
        const time = startTime + i * 7 * 24 * 60 * 60 * 1000;
        const variation = (Math.random() - 0.5) * 10000;
        const open = basePrice + variation;
        const close = open + (Math.random() - 0.5) * 2000;
        const high = Math.max(open, close) + Math.random() * 1000;
        const low = Math.min(open, close) - Math.random() * 1000;
        
        data.push({
          time: time / 1000,
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
          volume: Math.random() * 1000000
        });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error fetching OHLC data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Authentication Routes
  app.post('/api/auth/register', [
    validateEmail,
    validatePassword,
    validateInput
  ], async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          message: 'User already exists',
          code: 'USER_EXISTS',
          timestamp: new Date().toISOString()
        });
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await storage.createUser({
        email: sanitizeInput(email),
        hashedPassword: hashedPassword,
        firstName: sanitizeInput(name || ''),
        role: 'user',
        subscriptionTier: 'free'
      });
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subscriptionTier: user.subscriptionTier
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        code: 'REGISTRATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.post('/api/auth/login', [
    validateEmail,
    validatePassword,
    validateInput
  ], async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString()
        });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString()
        });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subscriptionTier: user.subscriptionTier
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        code: 'LOGIN_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Protected User Routes
  app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin Routes
  app.get('/api/admin/users', requireAuth, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'superuser') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt
      })));
    } catch (error) {
      console.error('Admin users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/admin/analytics', requireAuth, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'superuser') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const users = await storage.getAllUsers();
      const signals = await storage.getAllSignals();
      const tickers = await storage.getAllTickers();
      
      res.json({
        totalUsers: users.length,
        totalSignals: signals.length,
        totalTickers: tickers.length,
        revenue: 477, // Mock revenue data
        activeUsers: users.filter(u => u.subscriptionTier !== 'free').length
      });
    } catch (error) {
      console.error('Admin analytics error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Subscription Management Routes
  app.get("/api/subscription/plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Create subscription endpoint for upgrade page
  app.post("/api/create-subscription", requireAuth, async (req: any, res) => {
    try {
      const { planTier, billingInterval } = req.body;
      
      // Validate input
      if (!planTier || !billingInterval) {
        return res.status(400).json({ 
          message: "Plan tier and billing interval are required" 
        });
      }

      // Validate plan tier
      const validTiers = ['basic', 'premium', 'pro'];
      if (!validTiers.includes(planTier)) {
        return res.status(400).json({ 
          message: "Invalid plan tier" 
        });
      }

      // Check if user is already on this plan
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.subscriptionTier === planTier) {
        return res.status(400).json({ 
          message: `You are already subscribed to the ${planTier} plan`
        });
      }

      // For demo purposes, simulate successful subscription creation
      // In production, this would integrate with Stripe
      const updatedUser = await storage.updateUser(req.user.id, {
        subscriptionTier: planTier,
        subscriptionStatus: 'active',
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });

      res.status(201).json({
        success: true,
        message: `Successfully upgraded to ${planTier} plan`,
        subscription: {
          planTier,
          billingInterval,
          status: 'active',
          endsAt: updatedUser?.subscriptionEndsAt
        },
        user: {
          id: updatedUser?.id,
          email: updatedUser?.email,
          subscriptionTier: updatedUser?.subscriptionTier,
          subscriptionStatus: updatedUser?.subscriptionStatus
        }
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ 
        message: "Failed to create subscription",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Market Data Endpoints
  app.get("/api/market/price/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Try to fetch from Binance with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        
        if (!response.ok) {
          throw new Error(`Binance API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        const priceData = {
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChange),
          changePercent24h: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.volume),
          lastUpdate: new Date().toISOString(),
        };
        
        res.json(priceData);
      } catch (fetchError) {
        clearTimeout(timeout);
        
        // Fallback to mock data when external API fails
        console.log(`External API failed for ${symbol}, using fallback data`);
        
        const mockPrices: Record<string, any> = {
          'BTCUSDT': { base: 67543.21, symbol: 'BTCUSDT' },
          'ETHUSDT': { base: 3421.89, symbol: 'ETHUSDT' },
          'SOLUSDT': { base: 98.34, symbol: 'SOLUSDT' },
          'ADAUSDT': { base: 0.4567, symbol: 'ADAUSDT' },
          'BNBUSDT': { base: 342.15, symbol: 'BNBUSDT' },
          'XRPUSDT': { base: 0.6234, symbol: 'XRPUSDT' },
          'DOTUSDT': { base: 7.89, symbol: 'DOTUSDT' },
          'MATICUSDT': { base: 0.8923, symbol: 'MATICUSDT' },
        };
        
        const mockData = mockPrices[symbol] || { base: 100, symbol };
        const change = (Math.random() - 0.5) * 10; // Random change between -5% and +5%
        const price = mockData.base * (1 + change / 100);
        
        const fallbackData = {
          symbol: mockData.symbol,
          price: price,
          change24h: change,
          changePercent24h: (change / mockData.base) * 100,
          volume24h: Math.random() * 1000000000,
          lastUpdate: new Date().toISOString(),
          isFallback: true
        };
        
        res.json(fallbackData);
      }
    } catch (error: any) {
      console.error("Error in market price endpoint:", error);
      res.status(500).json({ message: "Failed to get market price" });
    }
  });

  // Get available tickers (enabled only)
  app.get("/api/tickers/enabled", async (req, res) => {
    try {
      const tickers = await storage.getEnabledTickers();
      res.json(tickers);
    } catch (error) {
      console.error("Error fetching enabled tickers:", error);
      res.status(500).json({ message: "Failed to fetch enabled tickers" });
    }
  });

  // Get all tickers with optional filtering
  app.get("/api/tickers", async (req, res) => {
    try {
      const { search, limit = 50, offset = 0, category, is_enabled } = req.query;
      let tickers = await storage.getAllTickers();
      
      // Apply filters
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        tickers = tickers.filter(ticker => 
          ticker.symbol.toLowerCase().includes(searchTerm) ||
          ticker.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (category) {
        tickers = tickers.filter(ticker => ticker.category === category);
      }
      
      if (is_enabled !== undefined) {
        const enabled = is_enabled === 'true';
        tickers = tickers.filter(ticker => ticker.isEnabled === enabled);
      }
      
      // Apply pagination
      const start = parseInt(offset.toString());
      const end = start + parseInt(limit.toString());
      const paginatedTickers = tickers.slice(start, end);
      
      res.json({
        tickers: paginatedTickers,
        total: tickers.length,
        offset: start,
        limit: parseInt(limit.toString())
      });
    } catch (error) {
      console.error("Error fetching tickers:", error);
      res.status(500).json({ message: "Failed to fetch tickers" });
    }
  });

  // OHLC Data Endpoint (public access for charts)
  app.get("/api/public/ohlc", async (req, res) => {
    try {
      const { symbol, interval = "1w", limit = 104 } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ message: "Symbol parameter is required" });
      }
      
      // Fetch from Binance API
      const binanceInterval = interval === "1w" ? "1w" : "1d";
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Binance API error: ${response.status}`);
        }
        
        const data = await response.json();
        const ohlcData = data.map((item: any[]) => ({
          timestamp: item[0],
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5])
        }));
        
        res.json(ohlcData);
      } catch (fetchError) {
        // Return minimal mock data for development
        const mockOhlc = Array.from({ length: Number(limit) }, (_, i) => ({
          timestamp: Date.now() - (Number(limit) - i) * 7 * 24 * 60 * 60 * 1000, // Weekly intervals
          open: 67000 + Math.random() * 1000,
          high: 67500 + Math.random() * 1000,
          low: 66500 + Math.random() * 1000,
          close: 67000 + Math.random() * 1000,
          volume: Math.random() * 1000000
        }));
        
        res.json(mockOhlc);
      }
    } catch (error) {
      console.error("Error fetching OHLC data:", error);
      res.status(500).json({ message: "Failed to fetch OHLC data" });
    }
  });

  // Public Signals Endpoint (for charts)
  app.get("/api/public/signals/alerts", async (req, res) => {
    try {
      const { ticker, timeframe = "1W", limit = 10 } = req.query;
      
      if (!ticker) {
        return res.status(400).json({ message: "Ticker parameter is required" });
      }
      
      const signals = await storage.getSignalsByTicker(ticker.toString(), timeframe.toString());
      const limitedSignals = signals.slice(0, Number(limit));
      
      res.json(limitedSignals);
    } catch (error) {
      console.error("Error fetching signals:", error);
      // Return empty array for development
      res.json([]);
    }
  });

  // Public Market Price Endpoint (for live charts)
  app.get("/api/public/market/price/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Try to fetch from Binance with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        
        if (!response.ok) {
          throw new Error(`Binance API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        const priceData = {
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChange),
          changePercent24h: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.volume),
          lastUpdate: new Date().toISOString(),
        };
        
        res.json(priceData);
      } catch (fetchError) {
        clearTimeout(timeout);
        
        // Fallback to basic price for development
        const mockPrices: Record<string, number> = {
          'BTCUSDT': 67543.21,
          'ETHUSDT': 3421.89,
          'SOLUSDT': 98.34,
          'ADAUSDT': 0.4567,
        };
        
        const basePrice = mockPrices[symbol] || 100;
        const change = (Math.random() - 0.5) * 5; // ±2.5% change
        const price = basePrice * (1 + change / 100);
        
        res.json({
          symbol,
          price: parseFloat(price.toFixed(2)),
          change24h: change,
          changePercent24h: (change / basePrice) * 100,
          volume24h: Math.random() * 1000000,
          lastUpdate: new Date().toISOString(),
          isFallback: true
        });
      }
    } catch (error: any) {
      console.error("Error in public market price endpoint:", error);
      res.status(500).json({ message: "Failed to get market price" });
    }
  });

  return httpServer;
}