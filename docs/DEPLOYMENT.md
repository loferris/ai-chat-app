# Deployment Guide

This guide covers deploying the chat application to various platforms.

## Prerequisites

- Node.js 18+
- OpenRouter API key (optional - app works with mock assistant)
- Git repository access

## Environment Setup

1. **Copy environment configuration:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure API key (optional):**
   - Get OpenRouter API key from: https://openrouter.ai/keys
   - Update `OPENROUTER_API_KEY` in `.env.local`
   - Format: `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Set environment:**
   ```bash
   NODE_ENV=production
   ```

## Deployment Options

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Environment Variables for Vercel:**
```
DATABASE_URL="file:./prisma/dev.db"
OPENROUTER_API_KEY="your-api-key-here"
NODE_ENV="production"
```

### Docker

```bash
# Build
npm run build

# Create Dockerfile
cat > Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build and run
docker build -t chat-app .
docker run -p 3000:3000 chat-app
```

### Traditional Hosting

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Database Setup

### Development (SQLite)
```bash
npx prisma generate
npx prisma db push
```

### Production (PostgreSQL)
1. Set up PostgreSQL database
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npx prisma db push`

## Features

### Demo Mode
- App works without API keys using mock assistant
- Perfect for showcasing functionality
- Enable by setting `DEMO_MODE=true`

### Production Mode
- Requires OpenRouter API key
- Real AI responses
- Full functionality

## Security Features

- Input validation (10K character limit)
- Rate limiting (30 messages/min, 100 API calls/min)
- Session-based access control
- Database transactions
- Structured logging

## Monitoring

- Health check endpoint: `/api/health`
- Database connection monitoring
- Error logging and handling

## Troubleshooting

### Common Issues

1. **Build failures**
   - Run `npm run test` to check for issues
   - Clear cache: `rm -rf .next node_modules && npm install`

2. **Database connection errors**
   - Verify `DATABASE_URL` format
   - Ensure database is running
   - Check file permissions for SQLite

3. **API key issues**
   - Ensure key starts with `sk-or-v1-`
   - Check for extra spaces in environment variables

## Support

- **OpenRouter API**: https://openrouter.ai/docs
- **Next.js deployment**: https://nextjs.org/docs/deployment
- **Prisma database**: https://prisma.io/docs
