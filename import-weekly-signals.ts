import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './shared/schema.js';

// Weekly signals data from the export
const weeklySignals = [
  {
    id: '11a7bd26-27ed-4141-a805-1244d917dc2c',
    ticker: 'BTCUSDT',
    signalType: 'buy',
    price: 92400.00,
    timestamp: '2025-01-07T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'January dip buy opportunity'
  },
  {
    id: 'a626973f-9daf-428a-9e4b-4e36444b3ea4',
    ticker: 'BTCUSDT',
    signalType: 'sell',
    price: 108000.00,
    timestamp: '2024-12-17T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'Year-end profit taking begins'
  },
  {
    id: '782baee7-8950-40e6-b09a-253a6b6ef79f',
    ticker: 'BTCUSDT',
    signalType: 'buy',
    price: 95600.00,
    timestamp: '2024-11-06T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'Post-election bullish breakout'
  },
  {
    id: '3ab4015c-b462-4f0f-83f1-6634be990b8b',
    ticker: 'BTCUSDT',
    signalType: 'buy',
    price: 67200.00,
    timestamp: '2024-09-19T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'Q4 institutional accumulation'
  },
  {
    id: 'f4cfea99-7f9e-4cd6-8737-03b8b8e94181',
    ticker: 'BTCUSDT',
    signalType: 'buy',
    price: 56800.00,
    timestamp: '2024-07-05T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'Mid-cycle correction recovery'
  },
  {
    id: '9fefe488-e898-4904-a0fb-b095169373cf',
    ticker: 'BTCUSDT',
    signalType: 'sell',
    price: 73800.00,
    timestamp: '2024-03-28T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'All-time high resistance'
  },
  {
    id: '184e3241-98a1-4572-8b8a-1adc445b388a',
    ticker: 'BTCUSDT',
    signalType: 'buy',
    price: 42000.00,
    timestamp: '2024-02-12T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'ETF approval rally begins'
  },
  {
    id: '1503c04b-ca06-40b2-8083-4e08a43ad9cd',
    ticker: 'BTCUSDT',
    signalType: 'buy',
    price: 25800.00,
    timestamp: '2023-10-10T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'Strong support retest successful'
  },
  {
    id: '94139959-65b6-4871-977d-41ac2be07b7f',
    ticker: 'BTCUSDT',
    signalType: 'sell',
    price: 31000.00,
    timestamp: '2023-07-20T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'Major resistance rejection'
  },
  {
    id: '039ca51d-b830-4186-a40b-b747d83c6084',
    ticker: 'BTCUSDT',
    signalType: 'buy',
    price: 26800.00,
    timestamp: '2023-06-05T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'Breakout above 25k resistance'
  },
  {
    id: '625c45d4-4061-471b-9007-d19e85ac425d',
    ticker: 'BTCUSDT',
    signalType: 'sell',
    price: 25200.00,
    timestamp: '2023-04-14T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'Resistance at 25k level'
  },
  {
    id: '0ea04047-e180-4850-a116-d064f2b3b57b',
    ticker: 'BTCUSDT',
    signalType: 'buy',
    price: 15476.00,
    timestamp: '2023-01-02T00:00:00Z',
    timeframe: '1W',
    source: 'historical',
    notes: 'Support bounce after FTX crash recovery'
  }
];

async function importWeeklySignals() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found');
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    console.log('🚀 Starting weekly signals import...');
    
    // Delete existing weekly signals for BTCUSDT
    console.log('🗑️ Clearing existing weekly signals...');
    await sql`DELETE FROM alert_signals WHERE ticker = 'BTCUSDT' AND timeframe = '1W'`;
    
    // Insert new signals
    console.log('📊 Inserting weekly signals...');
    for (const signal of weeklySignals) {
      await sql`
        INSERT INTO alert_signals (id, ticker, signal_type, price, timestamp, timeframe, source, note, created_at, updated_at)
        VALUES (
          ${signal.id},
          ${signal.ticker},
          ${signal.signalType},
          ${signal.price},
          ${signal.timestamp},
          ${signal.timeframe},
          ${signal.source},
          ${signal.notes},
          NOW(),
          NOW()
        )
      `;
    }

    console.log(`✅ Successfully imported ${weeklySignals.length} weekly signals!`);
    
    // Verify the import
    const count = await sql`SELECT COUNT(*) as count FROM alert_signals WHERE ticker = 'BTCUSDT' AND timeframe = '1W'`;
    console.log(`✅ Verification: ${count[0].count} weekly signals in database`);
    
  } catch (error) {
    console.error('❌ Error importing weekly signals:', error);
    process.exit(1);
  }
}

importWeeklySignals();