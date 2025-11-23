# Production Deployment

Развёртывание Payload CMS в production окружении требует тщательной подготовки и конфигурации для обеспечения безопасности, производительности и надёжности.

## Подготовка к развертыванию

### Требования к окружению

- **Node.js:** 18.17.0 или выше
- **База данных:** MongoDB, PostgreSQL или SQLite
- **Объёмное хранилище:** S3, Cloudinary или другое решение
- **Email сервис:** Resend, SendGrid и т.д.
- **Домен и SSL:** HTTPS обязателен

### Переменные окружения

```env
# Payload Core
PAYLOAD_SECRET=your-super-secret-key-here
NODE_ENV=production
PORT=3000

# Database
DATABASE_URI=postgresql://user:password@localhost:5432/payload_prod
# или MongoDB:
MONGODB_URI=mongodb://user:password@host:port/database

# CORS
PAYLOAD_PUBLIC_CORS_ORIGIN=https://yourdomain.com

# File Uploads
PAYLOAD_PUBLIC_S3_BUCKET=your-production-bucket
PAYLOAD_PUBLIC_S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Email
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

## Варианты развертывания

### 1. Vercel (Serverless)

**Преимущества:**
- Автоматическое масштабирование
- CDN включена
- CI/CD интеграция
- Простота настройки

**Настройка:**

```bash
# Установка Vercel CLI
npm i -g vercel

# Развертывание
vercel --prod
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "PAYLOAD_SECRET": "@payload-secret",
    "DATABASE_URI": "@database-uri"
  },
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

**Ограничения:**
- Timeout функций (10-30 секунд)
- Размер пакета (50MB)
- Ограничения бесплатного плана

### 2. Railway (Container)

**Преимущества:**
- Полный контроль над окружением
- Долгие операции возможны
- Прямое подключение к базе данных

**railway.toml:**
```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health-check"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[[services]]
name = "payload-cms"
source = "."
[services.env]
NODE_ENV = "production"
PORT = "3000"
```

### 3. Docker (Self-hosted)

**Преимущества:**
- Полная изоляция
- Масштабируемость
- Контроль версий

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  payload:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URI=postgresql://postgres:password@db:5432/payload
      - PAYLOAD_SECRET=your-secret-here
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=payload
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

### 4. AWS ECS/EC2

**Преимущества:**
- Масштабируемость
- Интеграция с AWS сервисами
- Высокая доступность

**task-definition.json:**
```json
{
  "family": "payload-cms",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "payload-cms",
      "image": "your-account.dkr.ecr.region.amazonaws.com/payload-cms:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "PAYLOAD_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:payload-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/payload-cms",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Безопасность в production

### 1. HTTPS и SSL

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
}
```

### 2. Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100

  const windowStart = now - windowMs
  const requests = rateLimit.get(ip) || []

  const validRequests = requests.filter((timestamp: number) => timestamp > windowStart)

  if (validRequests.length >= maxRequests) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  validRequests.push(now)
  rateLimit.set(ip, validRequests)

  return NextResponse.next()
}

export const config = {
  matcher: '/api/(.*)',
}
```

### 3. Payload Security Configuration

```typescript
// payload.config.ts
export default buildConfig({
  cors: [
    'https://yourdomain.com',
    'https://admin.yourdomain.com',
  ],
  csrf: [
    'https://yourdomain.com',
    'https://admin.yourdomain.com',
  ],
  admin: {
    csrf: true,
  },
})
```

## Мониторинг и логирование

### 1. Health Check Endpoint

```typescript
// pages/api/health-check.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import getPayload from '../../payload'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const payload = await getPayload()

    // Test database connection
    await payload.find({
      collection: 'users',
      limit: 1,
    })

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
```

### 2. Sentry Integration

```typescript
// payload.config.ts
import * as Sentry from '@sentry/nextjs'

export default buildConfig({
  hooks: {
    onError: async ({ error }) => {
      Sentry.captureException(error)
    },
    afterOperation: [
      async ({ operation, collection, req }) => {
        if (['create', 'update', 'delete'].includes(operation)) {
          Sentry.addBreadcrumb({
            category: 'payload',
            message: `${operation} on ${collection}`,
            level: 'info',
            data: {
              user: req.user?.id,
              ip: req.ip,
            },
          })
        }
      },
    ],
  },
})
```

### 3. Logging Strategy

```typescript
// utils/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

## Backup Strategy

### 1. Database Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# PostgreSQL backup
pg_dump $DATABASE_URI > "$BACKUP_DIR/postgres_$DATE.sql"

# MongoDB backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb_$DATE"

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.mongodb" -mtime +7 -delete
```

### 2. File Storage Backups

```bash
#!/bin/bash
# backup-s3.sh

BUCKET="your-bucket"
DATE=$(date +%Y%m%d_%H%M%S)

# Sync S3 bucket to local
aws s3 sync s3://$BUCKET "./backups/s3_$DATE" --delete

# Compress backup
tar -czf "./backups/s3_$DATE.tar.gz" "./backups/s3_$DATE"
rm -rf "./backups/s3_$DATE"
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Best Practices

### 1. Environment Management
- Используйте разные конфигурации для development, staging, и production
- Храните секреты в безопасном хранилище
- Регулярно ротируйте ключи и пароли

### 2. Performance Optimization
- Включите кэширование на всех уровнях
- Оптимизируйте изображения и файлы
- Используйте CDN для статических ресурсов

### 3. Scalability
- Разделяйте веб-сервер и базу данных
- Используйте connection pooling
- Настраивайте автоматическое масштабирование

### 4. Reliability
- Настраивайте health checks
- Реализуйте graceful shutdown
- Используйте circuit breakers для внешних сервисов

### 5. Monitoring
- Отслеживайте метрики производительности
- Настраивайте алерты для критических событий
- Логируйте все важные операции

## Troubleshooting

### Common Issues

1. **Memory Leaks**
   - Мониторьте использование памяти
   - Проверяйте закрытие соединений с БД
   - Оптимизируйте сложные запросы

2. **Database Connection Issues**
   - Используйте connection pooling
   - Настраивайте таймауты
   - Реализуйте retry logic

3. **File Upload Failures**
   - Проверьте настройки CORS
   - Убедитесь в правильной конфигурации S3
   - Мониторьте лимиты размера файлов

4. **Performance Degradation**
   - Анализируйте медленные запросы
   - Оптимизируйте индексы БД
   - Включите кэширование

## Production Checklist

- [ ] Все переменные окружения настроены
- [ ] HTTPS включен и настроен
- [ ] База данных оптимизирована
- [ ] Резервное копирование настроено
- [ ] Мониторинг и алерты работают
- [ ] Rate limiting включен
- [ ] CORS правильно настроен
- [ ] Логирование включено
- [ ] Health check endpoint работает
- [ ] Процесс деплоя автоматизирован