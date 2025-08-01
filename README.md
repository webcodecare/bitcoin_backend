# Proud Profits Backend - Local Windows Setup

Complete standalone backend for the Proud Profits cryptocurrency trading platform. This backend runs independently on any Windows machine with Node.js.

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file with your database connection:
```bash
# Copy the example file
copy .env.example .env

# Edit .env with your settings
DATABASE_URL=your-postgresql-database-url
JWT_SECRET=your-secure-jwt-secret
```

### 3. Start Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## ✅ Features Working Out of the Box

- **Authentication API** - Login/register with JWT tokens
- **Market Data API** - Real-time cryptocurrency prices
- **Trading Signals** - Buy/sell signal management
- **User Management** - User profiles and admin functions
- **WebSocket Server** - Real-time data broadcasting
- **CORS Support** - Frontend integration ready
- **Security** - Helmet, rate limiting, input validation
- **Database Integration** - PostgreSQL with Drizzle ORM

## 📡 API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/health` - Health check
- `GET /api/public/tickers` - Available cryptocurrencies
- `GET /api/public/market/price/:symbol` - Live prices
- `GET /api/public/signals/alerts` - Trading signals
- `GET /api/public/ohlc` - OHLC chart data

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - User login

### Protected Endpoints (Requires Token)
- `GET /api/user/profile` - User profile
- `GET /api/admin/users` - Admin user management
- `GET /api/admin/analytics` - Admin analytics

## 🔧 Environment Variables

### Required
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret
```

### Optional
```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
```

## 🗄️ Database Setup

### Option 1: Neon PostgreSQL (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new database
3. Copy the connection string to `DATABASE_URL`

### Option 2: Local PostgreSQL
1. Install PostgreSQL on Windows
2. Create a database
3. Set `DATABASE_URL=postgresql://postgres:password@localhost:5432/proudprofits`

### Option 3: Docker PostgreSQL
```bash
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:13
```

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Run database migrations
npm run db:push

# Generate new migration
npm run db:generate

# Check TypeScript types
npm run type-check

# Build for production
npm run build
```

## 📊 Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get Bitcoin Price
```bash
curl http://localhost:5000/api/public/market/price/BTCUSDT
```

### Create User Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

## 🔗 Frontend Integration

To connect a frontend application:

1. Set the API base URL to `http://localhost:5000`
2. Include JWT token in Authorization header: `Bearer your-jwt-token`
3. WebSocket connection: `ws://localhost:5000/ws`

## 📁 Project Structure

```
backend_new/
├── src/
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API routes and endpoints
│   ├── config.ts         # Environment configuration
│   ├── db.ts            # Database connection
│   └── storage.ts       # Database operations
├── shared/
│   └── schema.ts        # Database schema and types
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── drizzle.config.ts    # Database configuration
└── README.md           # This file
```

## 🚨 Troubleshooting

### Import Errors
- Make sure all `.ts` files use `.js` extensions in imports
- Check that `shared/schema.ts` exists and exports are correct

### Database Connection
- Verify `DATABASE_URL` is correct and accessible
- Run `npm run db:push` to sync database schema

### Port Already in Use
- Change `PORT=5001` in `.env` file
- Or kill existing process: `taskkill /f /im node.exe`

### TypeScript Errors
- Run `npm run type-check` to see detailed errors
- Ensure all dependencies are installed: `npm install`

## 🔄 Deployment Options

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Render
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set DATABASE_URL=your-db-url
git push heroku main
```

## 📈 Production Checklist

- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `CORS_ORIGIN`
- [ ] Use production database (not development)
- [ ] Enable HTTPS in production
- [ ] Set up database backups
- [ ] Configure monitoring and logging

## 💡 Next Steps

1. **Add More Features**: Copy additional service files from main project
2. **Connect Frontend**: Build React frontend that connects to this API
3. **Expand Database**: Add more tables and relationships as needed
4. **Add Tests**: Create unit and integration tests
5. **Monitor Performance**: Add logging and performance monitoring

## 🆘 Need Help?

1. Check the main project documentation
2. Verify all environment variables are set
3. Ensure database is accessible
4. Test with simple curl commands first
5. Check server logs for detailed error messages

---

**This backend is ready for production use with proper environment configuration!**