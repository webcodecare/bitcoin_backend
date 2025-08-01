import { db } from "./db.js";
import { users, userSettings, availableTickers, alertSignals, ohlcCache, webhookSecrets, tradingSettings } from "../shared/schema.js";
import type { User, InsertUser, UserSettings, InsertUserSettings, AvailableTicker, InsertTicker, AlertSignal, InsertSignal, OhlcData, InsertOhlc, WebhookSecret, InsertWebhookSecret, TradingSettings, InsertTradingSettings } from "../shared/schema.js";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // User Settings
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  getUserSettings(userId: string): Promise<UserSettings | null>;
  updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | null>;

  // Available Tickers
  createTicker(ticker: InsertTicker): Promise<AvailableTicker>;
  getTickerById(id: string): Promise<AvailableTicker | null>;
  getTickerBySymbol(symbol: string): Promise<AvailableTicker | null>;
  getAllTickers(): Promise<AvailableTicker[]>;
  getEnabledTickers(): Promise<AvailableTicker[]>;
  updateTicker(id: string, updates: Partial<AvailableTicker>): Promise<AvailableTicker | null>;
  deleteTicker(id: string): Promise<boolean>;

  // Alert Signals
  createSignal(signal: InsertSignal): Promise<AlertSignal>;
  getSignalById(id: string): Promise<AlertSignal | null>;
  getSignalsByTicker(ticker: string, timeframe?: string): Promise<AlertSignal[]>;
  getSignalsByUser(userId: string): Promise<AlertSignal[]>;
  getAllSignals(): Promise<AlertSignal[]>;
  updateSignal(id: string, updates: Partial<AlertSignal>): Promise<AlertSignal | null>;
  deleteSignal(id: string): Promise<boolean>;

  // OHLC Data
  createOhlcData(data: InsertOhlc): Promise<OhlcData>;
  getOhlcData(tickerSymbol: string, interval: string, startTime?: Date, endTime?: Date): Promise<OhlcData[]>;
  updateOhlcData(id: string, updates: Partial<OhlcData>): Promise<OhlcData | null>;
  deleteOhlcData(id: string): Promise<boolean>;

  // Webhook Secrets
  createWebhookSecret(secret: InsertWebhookSecret): Promise<WebhookSecret>;
  getWebhookSecretByName(name: string): Promise<WebhookSecret | null>;
  getAllWebhookSecrets(): Promise<WebhookSecret[]>;
  updateWebhookSecret(id: string, updates: Partial<WebhookSecret>): Promise<WebhookSecret | null>;
  deleteWebhookSecret(id: string): Promise<boolean>;

  // Trading Settings
  createTradingSettings(settings: InsertTradingSettings): Promise<TradingSettings>;
  getTradingSettings(userId: string): Promise<TradingSettings | null>;
  updateTradingSettings(userId: string, updates: Partial<TradingSettings>): Promise<TradingSettings | null>;

  // Subscription Plans
  getSubscriptionPlans(): Promise<any[]>;
}

export class PostgresStorage implements IStorage {
  // User management
  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // User Settings
  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [created] = await db.insert(userSettings).values(settings).returning();
    return created;
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings || null;
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | null> {
    const [updated] = await db.update(userSettings).set(updates).where(eq(userSettings.userId, userId)).returning();
    return updated || null;
  }

  // Available Tickers
  async createTicker(ticker: InsertTicker): Promise<AvailableTicker> {
    const [created] = await db.insert(availableTickers).values(ticker).returning();
    return created;
  }

  async getTickerById(id: string): Promise<AvailableTicker | null> {
    const [ticker] = await db.select().from(availableTickers).where(eq(availableTickers.id, id));
    return ticker || null;
  }

  async getTickerBySymbol(symbol: string): Promise<AvailableTicker | null> {
    const [ticker] = await db.select().from(availableTickers).where(eq(availableTickers.symbol, symbol));
    return ticker || null;
  }

  async getAllTickers(): Promise<AvailableTicker[]> {
    return await db.select().from(availableTickers).orderBy(availableTickers.symbol);
  }

  async getEnabledTickers(): Promise<AvailableTicker[]> {
    return await db.select().from(availableTickers).where(eq(availableTickers.isEnabled, true)).orderBy(availableTickers.symbol);
  }

  async updateTicker(id: string, updates: Partial<AvailableTicker>): Promise<AvailableTicker | null> {
    const [updated] = await db.update(availableTickers).set(updates).where(eq(availableTickers.id, id)).returning();
    return updated || null;
  }

  async deleteTicker(id: string): Promise<boolean> {
    const result = await db.delete(availableTickers).where(eq(availableTickers.id, id));
    return result.rowCount > 0;
  }

  // Alert Signals
  async createSignal(signal: InsertSignal): Promise<AlertSignal> {
    const [created] = await db.insert(alertSignals).values(signal).returning();
    return created;
  }

  async getSignalById(id: string): Promise<AlertSignal | null> {
    const [signal] = await db.select().from(alertSignals).where(eq(alertSignals.id, id));
    return signal || null;
  }

  async getSignalsByTicker(ticker: string, timeframe?: string): Promise<AlertSignal[]> {
    const conditions = [eq(alertSignals.ticker, ticker)];
    if (timeframe) {
      conditions.push(eq(alertSignals.timeframe, timeframe));
    }
    return await db.select().from(alertSignals).where(and(...conditions)).orderBy(desc(alertSignals.timestamp));
  }

  async getSignalsByUser(userId: string): Promise<AlertSignal[]> {
    return await db.select().from(alertSignals).where(eq(alertSignals.userId, userId)).orderBy(desc(alertSignals.timestamp));
  }

  async getAllSignals(): Promise<AlertSignal[]> {
    return await db.select().from(alertSignals).orderBy(desc(alertSignals.timestamp));
  }

  async updateSignal(id: string, updates: Partial<AlertSignal>): Promise<AlertSignal | null> {
    const [updated] = await db.update(alertSignals).set(updates).where(eq(alertSignals.id, id)).returning();
    return updated || null;
  }

  async deleteSignal(id: string): Promise<boolean> {
    const result = await db.delete(alertSignals).where(eq(alertSignals.id, id));
    return result.rowCount > 0;
  }

  // OHLC Data
  async createOhlcData(data: InsertOhlc): Promise<OhlcData> {
    const [created] = await db.insert(ohlcCache).values(data).returning();
    return created;
  }

  async getOhlcData(tickerSymbol: string, interval: string, startTime?: Date, endTime?: Date): Promise<OhlcData[]> {
    const conditions = [
      eq(ohlcCache.tickerSymbol, tickerSymbol),
      eq(ohlcCache.interval, interval)
    ];
    
    if (startTime) {
      conditions.push(gte(ohlcCache.time, startTime));
    }
    if (endTime) {
      conditions.push(lte(ohlcCache.time, endTime));
    }

    return await db.select().from(ohlcCache).where(and(...conditions)).orderBy(ohlcCache.time);
  }

  async updateOhlcData(id: string, updates: Partial<OhlcData>): Promise<OhlcData | null> {
    const [updated] = await db.update(ohlcCache).set(updates).where(eq(ohlcCache.id, id)).returning();
    return updated || null;
  }

  async deleteOhlcData(id: string): Promise<boolean> {
    const result = await db.delete(ohlcCache).where(eq(ohlcCache.id, id));
    return result.rowCount > 0;
  }

  // Webhook Secrets
  async createWebhookSecret(secret: InsertWebhookSecret): Promise<WebhookSecret> {
    const [created] = await db.insert(webhookSecrets).values(secret).returning();
    return created;
  }

  async getWebhookSecretByName(name: string): Promise<WebhookSecret | null> {
    const [secret] = await db.select().from(webhookSecrets).where(eq(webhookSecrets.name, name));
    return secret || null;
  }

  async getAllWebhookSecrets(): Promise<WebhookSecret[]> {
    return await db.select().from(webhookSecrets);
  }

  async updateWebhookSecret(id: string, updates: Partial<WebhookSecret>): Promise<WebhookSecret | null> {
    const [updated] = await db.update(webhookSecrets).set(updates).where(eq(webhookSecrets.id, id)).returning();
    return updated || null;
  }

  async deleteWebhookSecret(id: string): Promise<boolean> {
    const result = await db.delete(webhookSecrets).where(eq(webhookSecrets.id, id));
    return result.rowCount > 0;
  }

  // Trading Settings
  async createTradingSettings(settings: InsertTradingSettings): Promise<TradingSettings> {
    const [created] = await db.insert(tradingSettings).values(settings).returning();
    return created;
  }

  async getTradingSettings(userId: string): Promise<TradingSettings | null> {
    const [settings] = await db.select().from(tradingSettings).where(eq(tradingSettings.userId, userId));
    return settings || null;
  }

  async updateTradingSettings(userId: string, updates: Partial<TradingSettings>): Promise<TradingSettings | null> {
    const [updated] = await db.update(tradingSettings).set(updates).where(eq(tradingSettings.userId, userId)).returning();
    return updated || null;
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<any[]> {
    // Return static subscription plans for demo
    return [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 29,
        interval: 'monthly',
        features: ['Basic analytics', 'Email support', '10 signals/month']
      },
      {
        id: 'premium', 
        name: 'Premium Plan',
        price: 59,
        interval: 'monthly',
        features: ['Advanced analytics', 'Priority support', '50 signals/month', 'Real-time alerts']
      },
      {
        id: 'pro',
        name: 'Pro Plan', 
        price: 99,
        interval: 'monthly',
        features: ['All features', '24/7 support', 'Unlimited signals', 'Custom indicators', 'API access']
      }
    ];
  }
}

// In-memory storage for development when database is not available
export class MemStorage implements IStorage {
  private users: User[] = [];
  private userSettings: UserSettings[] = [];
  private tickers: AvailableTicker[] = [];
  private signals: AlertSignal[] = [];
  private ohlcData: OhlcData[] = [];
  private webhookSecrets: WebhookSecret[] = [];
  private tradingSettings: TradingSettings[] = [];

  async init(): Promise<void> {
    console.log('✅ In-memory storage initialized');
  }

  // User management
  async createUser(user: InsertUser): Promise<User> {
    const newUser = { ...user, id: user.id || `user-${Date.now()}` } as User;
    this.users.push(newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...updates };
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  // User Settings
  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const newSettings = { ...settings, id: `settings-${Date.now()}` } as UserSettings;
    this.userSettings.push(newSettings);
    return newSettings;
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return this.userSettings.find(s => s.userId === userId) || null;
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | null> {
    const index = this.userSettings.findIndex(s => s.userId === userId);
    if (index === -1) return null;
    this.userSettings[index] = { ...this.userSettings[index], ...updates };
    return this.userSettings[index];
  }

  // Available Tickers
  async createTicker(ticker: InsertTicker): Promise<AvailableTicker> {
    const newTicker = { ...ticker, id: ticker.id || `ticker-${Date.now()}` } as AvailableTicker;
    this.tickers.push(newTicker);
    return newTicker;
  }

  async getTickerById(id: string): Promise<AvailableTicker | null> {
    return this.tickers.find(t => t.id === id) || null;
  }

  async getTickerBySymbol(symbol: string): Promise<AvailableTicker | null> {
    return this.tickers.find(t => t.symbol === symbol) || null;
  }

  async getAllTickers(): Promise<AvailableTicker[]> {
    return this.tickers;
  }

  async getEnabledTickers(): Promise<AvailableTicker[]> {
    return this.tickers.filter(t => t.isEnabled);
  }

  async updateTicker(id: string, updates: Partial<AvailableTicker>): Promise<AvailableTicker | null> {
    const index = this.tickers.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.tickers[index] = { ...this.tickers[index], ...updates };
    return this.tickers[index];
  }

  async deleteTicker(id: string): Promise<boolean> {
    const index = this.tickers.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.tickers.splice(index, 1);
    return true;
  }

  // Alert Signals
  async createSignal(signal: InsertSignal): Promise<AlertSignal> {
    const newSignal = { ...signal, id: signal.id || `signal-${Date.now()}` } as AlertSignal;
    this.signals.push(newSignal);
    return newSignal;
  }

  async getSignalById(id: string): Promise<AlertSignal | null> {
    return this.signals.find(s => s.id === id) || null;
  }

  async getSignalsByTicker(ticker: string, timeframe?: string): Promise<AlertSignal[]> {
    return this.signals.filter(s => 
      s.ticker === ticker && (!timeframe || s.timeframe === timeframe)
    );
  }

  async getSignalsByUser(userId: string): Promise<AlertSignal[]> {
    return this.signals.filter(s => s.userId === userId);
  }

  async getAllSignals(): Promise<AlertSignal[]> {
    return this.signals;
  }

  async updateSignal(id: string, updates: Partial<AlertSignal>): Promise<AlertSignal | null> {
    const index = this.signals.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.signals[index] = { ...this.signals[index], ...updates };
    return this.signals[index];
  }

  async deleteSignal(id: string): Promise<boolean> {
    const index = this.signals.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.signals.splice(index, 1);
    return true;
  }

  // OHLC Data
  async createOhlcData(data: InsertOhlc): Promise<OhlcData> {
    const newData = { ...data, id: data.id || `ohlc-${Date.now()}` } as OhlcData;
    this.ohlcData.push(newData);
    return newData;
  }

  async getOhlcData(tickerSymbol: string, interval: string, startTime?: Date, endTime?: Date): Promise<OhlcData[]> {
    return this.ohlcData.filter(d => 
      d.tickerSymbol === tickerSymbol && 
      d.interval === interval &&
      (!startTime || d.timestamp >= startTime) &&
      (!endTime || d.timestamp <= endTime)
    );
  }

  async updateOhlcData(id: string, updates: Partial<OhlcData>): Promise<OhlcData | null> {
    const index = this.ohlcData.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.ohlcData[index] = { ...this.ohlcData[index], ...updates };
    return this.ohlcData[index];
  }

  async deleteOhlcData(id: string): Promise<boolean> {
    const index = this.ohlcData.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.ohlcData.splice(index, 1);
    return true;
  }

  // Webhook Secrets
  async createWebhookSecret(secret: InsertWebhookSecret): Promise<WebhookSecret> {
    const newSecret = { ...secret, id: secret.id || `webhook-${Date.now()}` } as WebhookSecret;
    this.webhookSecrets.push(newSecret);
    return newSecret;
  }

  async getWebhookSecretByName(name: string): Promise<WebhookSecret | null> {
    return this.webhookSecrets.find(s => s.name === name) || null;
  }

  async getAllWebhookSecrets(): Promise<WebhookSecret[]> {
    return this.webhookSecrets;
  }

  async updateWebhookSecret(id: string, updates: Partial<WebhookSecret>): Promise<WebhookSecret | null> {
    const index = this.webhookSecrets.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.webhookSecrets[index] = { ...this.webhookSecrets[index], ...updates };
    return this.webhookSecrets[index];
  }

  async deleteWebhookSecret(id: string): Promise<boolean> {
    const index = this.webhookSecrets.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.webhookSecrets.splice(index, 1);
    return true;
  }

  // Trading Settings
  async createTradingSettings(settings: InsertTradingSettings): Promise<TradingSettings> {
    const newSettings = { ...settings, id: settings.id || `trading-${Date.now()}` } as TradingSettings;
    this.tradingSettings.push(newSettings);
    return newSettings;
  }

  async getTradingSettings(userId: string): Promise<TradingSettings | null> {
    return this.tradingSettings.find(s => s.userId === userId) || null;
  }

  async updateTradingSettings(userId: string, updates: Partial<TradingSettings>): Promise<TradingSettings | null> {
    const index = this.tradingSettings.findIndex(s => s.userId === userId);
    if (index === -1) return null;
    this.tradingSettings[index] = { ...this.tradingSettings[index], ...updates };
    return this.tradingSettings[index];
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<any[]> {
    // Return static subscription plans for demo
    return [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 29,
        interval: 'monthly',
        features: ['Basic analytics', 'Email support', '10 signals/month']
      },
      {
        id: 'premium', 
        name: 'Premium Plan',
        price: 59,
        interval: 'monthly',
        features: ['Advanced analytics', 'Priority support', '50 signals/month', 'Real-time alerts']
      },
      {
        id: 'pro',
        name: 'Pro Plan', 
        price: 99,
        interval: 'monthly',
        features: ['All features', '24/7 support', 'Unlimited signals', 'Custom indicators', 'API access']
      }
    ];
  }
}

export const createStorage = async (): Promise<IStorage> => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('⚠️  No database configuration found. Using in-memory storage for development.');
    console.log('   To use a real database, set DATABASE_URL or provision a database.');
    const memStorage = new MemStorage();
    await memStorage.init();
    return memStorage;
  }
  
  try {
    console.log('🔗 Attempting database connection...');
    const storage = new PostgresStorage();
    console.log('✅ PostgreSQL storage initialized');
    return storage;
  } catch (error) {
    console.warn('❌ PostgreSQL connection failed, using in-memory storage for development');
    console.warn('   Database error:', error.message);
    console.warn('   Check your DATABASE_URL in .env file');
    
    const memStorage = new MemStorage();
    await memStorage.init();
    return memStorage;
  }
};

// Export storage creation function for use in routes
// Direct storage export removed to prevent top-level await issues