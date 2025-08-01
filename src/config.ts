// Backend Configuration - Environment Variables Management
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

export const config = {
  // Server Configuration
  port: Number(process.env.PORT) || 5001, // Use different port for backend_new
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'development-jwt-secret-change-in-production',
  sessionSecret: process.env.SESSION_SECRET || 'development-session-secret-change-in-production',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN,
  allowedOrigins: process.env.ALLOWED_ORIGINS,
  
  // SwiftLead Integration
  marketDataSource: process.env.MARKET_DATA_SOURCE || 'binance',
  swiftleadApiBaseUrl: process.env.SWIFTLEAD_API_BASE_URL,
  enableSwiftleadProxy: process.env.ENABLE_SWIFTLEAD_PROXY === 'true',
  
  // TradingView Webhook
  tradingViewWebhookSecret: process.env.TRADINGVIEW_WEBHOOK_SECRET || 'default_secret',
  
  // External APIs
  binanceApiKey: process.env.BINANCE_API_KEY,
  binanceSecretKey: process.env.BINANCE_SECRET_KEY,
  
  // Notification Services
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL,
  
  // Payment Processing
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  
  // AI Features
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Supabase (Optional)
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Health Check
  healthCheckPath: process.env.HEALTH_CHECK_PATH || '/api/tickers',
};

// Environment validation
export const validateConfig = () => {
  const missing = [];
  
  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.jwtSecret) missing.push('JWT_SECRET');
  if (!config.sessionSecret) missing.push('SESSION_SECRET');
  
  if (missing.length > 0) {
    if (config.nodeEnv === 'production') {
      console.error('Missing required environment variables:', missing);
      console.error('Please check your .env file configuration');
      process.exit(1);
    } else {
      console.log('⚠️  Missing some environment variables for full functionality:', missing);
      console.log('   Using fallback values for development. Set these in .env for production.');
    }
  }
  
  console.log('✅ Backend Configuration Loaded:', {
    port: config.port,
    environment: config.nodeEnv,
    databaseConnected: !!config.databaseUrl,
    authConfigured: !!config.jwtSecret,
    corsOrigin: config.corsOrigin || 'default',
    marketDataSource: config.marketDataSource,
    swiftleadProxy: config.enableSwiftleadProxy,
    notificationServices: {
      twilio: !!config.twilioAccountSid,
      telegram: !!config.telegramBotToken,
      sendgrid: !!config.sendgridApiKey,
    },
    externalAPIs: {
      binance: !!config.binanceApiKey,
      openai: !!config.openaiApiKey,
      stripe: !!config.stripeSecretKey,
    }
  });
};

// Initialize validation
validateConfig();