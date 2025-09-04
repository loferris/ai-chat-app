# Production Setup Guide

This guide covers deploying your chat application for solo use with proper security and performance.

## 🔧 Environment Setup

1. **Copy environment configuration:**
   ```bash
   cp env.example .env.local
   ```

2. **Configure your API key:**
   - Get your OpenRouter API key from: https://openrouter.ai/keys
   - Update `OPENROUTER_API_KEY` in `.env.local`
   - Format: `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Set production environment:**
   ```bash
   NODE_ENV=production
   ```

## 🛡️ Security Features (Already Implemented)

✅ **Input Validation**: 10,000 character limit on all user inputs  
✅ **Rate Limiting**: 30 chat messages/min, 100 API calls/min, 5 exports/min  
✅ **Database Transactions**: Atomic operations prevent data corruption  
✅ **API Key Validation**: Format checking and secure error handling  
✅ **Session-based Access**: Basic conversation ownership validation  

## 📊 Database Setup

### Development (SQLite)
```bash
npx prisma generate
npx prisma db push
```

### Production (PostgreSQL recommended)
1. **Set up PostgreSQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   ```

2. **Create database:**
   ```sql
   CREATE DATABASE chatapp;
   CREATE USER chatuser WITH PASSWORD 'your-secure-password';
   GRANT ALL PRIVILEGES ON DATABASE chatapp TO chatuser;
   ```

3. **Update DATABASE_URL:**
   ```
   DATABASE_URL="postgresql://chatuser:your-secure-password@localhost:5432/chatapp"
   ```

4. **Run migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for solo use)
```bash
npm install -g vercel
vercel --prod
```

### Option 2: Docker
```bash
npm run build
docker build -t chat-app .
docker run -p 3000:3000 chat-app
```

### Option 3: PM2 (VPS/Server)
```bash
npm install -g pm2
npm run build
pm2 start npm --name "chat-app" -- start
pm2 save
pm2 startup
```

## 🔍 Monitoring & Logs

### Built-in Logging
- **Database queries**: Logged in development mode
- **Rate limiting**: Headers show remaining requests
- **Errors**: Sanitized error messages (no sensitive data)

### Health Check Endpoint
Visit `/api/health` to verify the application is running.

## 🛠️ Performance Optimizations

### Already Implemented:
- ✅ Database connection pooling
- ✅ Graceful shutdown handling
- ✅ Memory-efficient rate limiting
- ✅ Transaction-based operations

### Additional Recommendations:
1. **Enable gzip compression** (handled by most hosting providers)
2. **Use CDN for static assets** (Vercel does this automatically)
3. **Monitor database performance** with query logging

## 🚨 Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET` (32+ random characters)
- [ ] Use HTTPS in production
- [ ] Set `ALLOWED_ORIGINS` for CORS if needed
- [ ] Regular backup of database
- [ ] Monitor rate limit logs for abuse
- [ ] Keep dependencies updated: `npm audit`

## 📈 Scaling Considerations

For solo use, current setup handles:
- **30 messages/minute** = 43,200 messages/day
- **100 API calls/minute** = 144,000 calls/day
- **5 exports/minute** = 7,200 exports/day

If you need more capacity:
1. Increase rate limits in `src/server/middleware/rateLimiter.ts`
2. Switch to Redis-backed rate limiting for multiple instances
3. Use PostgreSQL connection pooling

## 🆘 Troubleshooting

### Common Issues:

1. **"Invalid API key format"**
   - Ensure key starts with `sk-or-v1-`
   - Check for extra spaces in `.env.local`

2. **"Rate limit exceeded"**
   - Wait for the reset time shown in error message
   - Adjust limits in `rateLimiter.ts` if needed

3. **Database connection errors**
   - Verify `DATABASE_URL` format
   - Ensure database is running
   - Check file permissions for SQLite

4. **Build failures**
   - Run `npm run test` to check for issues
   - Clear cache: `rm -rf .next node_modules && npm install`

## 📞 Support

For issues with:
- **OpenRouter API**: https://openrouter.ai/docs
- **Next.js deployment**: https://nextjs.org/docs/deployment
- **Prisma database**: https://prisma.io/docs
