# Performance Optimization

Оптимизация производительности Payload CMS критически важна для обеспечения быстрого отклика и хорошего пользовательского опыта. Это руководство охватывает техники оптимизации на всех уровнях приложения.

## Анализ производительности

### 1. Мониторинг метрик

**Ключевые метрики для отслеживания:**

- **Time to First Byte (TTFB)** - время до первого байта
- **Database Query Time** - время выполнения запросов к БД
- **API Response Time** - время ответа API
- **Memory Usage** - использование памяти
- **CPU Usage** - использование процессора
- **File Upload/Download Speed** - скорость работы с файлами

**Инструменты мониторинга:**

```typescript
// middleware/performance.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function withPerformanceMonitoring(handler: Function) {
  return async (req: NextRequest) => {
    const start = performance.now()

    try {
      const response = await handler(req)

      const duration = performance.now() - start

      // Log performance metrics
      console.log({
        url: req.url,
        method: req.method,
        duration: Math.round(duration),
        status: response.status,
        timestamp: new Date().toISOString(),
      })

      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)
      return response
    } catch (error) {
      const duration = performance.now() - start

      console.error({
        url: req.url,
        method: req.method,
        duration: Math.round(duration),
        error: error.message,
        timestamp: new Date().toISOString(),
      })

      throw error
    }
  }
}
```

### 2. Performance Profiling

```typescript
// utils/profiler.ts
export class PerformanceProfiler {
  private static timers = new Map<string, number>()

  static start(name: string): void {
    this.timers.set(name, performance.now())
  }

  static end(name: string): number {
    const startTime = this.timers.get(name)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.timers.delete(name)

    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }

  static async measure<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.start(name)
    try {
      return await fn()
    } finally {
      this.end(name)
    }
  }
}
```

## Оптимизация базы данных

### 1. Индексация

```typescript
// payload.config.ts
export default buildConfig({
  collections: [
    {
      slug: 'posts',
      fields: [
        {
          name: 'title',
          type: 'text',
          index: true, // Создать индекс для поля title
        },
        {
          name: 'publishedAt',
          type: 'date',
          index: true,
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          index: true,
        },
      ],
    },
  ],
})
```

**Ручные индексы для MongoDB:**

```javascript
// scripts/create-indexes.js
const { MongoClient } = require('mongodb')

async function createIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()

  const db = client.db()

  // Compound indexes for common queries
  await db.collection('posts').createIndex({
    status: 1,
    publishedAt: -1,
  })

  await db.collection('posts').createIndex({
    author: 1,
    createdAt: -1,
  })

  // Text index for search
  await db.collection('posts').createIndex({
    title: 'text',
    content: 'text',
  })

  console.log('Indexes created successfully')
  await client.close()
}

createIndexes().catch(console.error)
```

### 2. Оптимизация запросов

```typescript
// Эффективная выборка данных
const posts = await payload.find({
  collection: 'posts',
  where: {
    status: { equals: 'published' },
    publishedAt: { less_than: new Date() },
  },
  sort: '-publishedAt',
  limit: 10,
  depth: 0, // Избегать глубокой популяции где возможно
  select: {
    title: true,
    slug: true,
    excerpt: true,
    publishedAt: true,
    author: {
      name: true,
      avatar: true,
    },
  },
})
```

### 3. Кэширование базы данных

```typescript
// utils/db-cache.ts
class DatabaseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)

    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  set(key: string, data: any, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

export const dbCache = new DatabaseCache()
```

## Кэширование API

### 1. HTTP Caching

```typescript
// pages/api/posts/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import getPayload from '../../../payload'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Cache headers
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30')
  res.setHeader('CDN-Cache-Control', 'public, s-maxage=300')

  const payload = await getPayload()

  const posts = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 20,
  })

  res.status(200).json(posts)
}
```

### 2. Redis Caching

```typescript
// utils/redis-cache.ts
import Redis from 'ioredis'

class RedisCache {
  private redis: Redis

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL)
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis invalidate error:', error)
    }
  }
}

export const redisCache = new RedisCache()
```

### 3. Payload Hooks с кэшированием

```typescript
// payload.config.ts
export default buildConfig({
  collections: [
    {
      slug: 'posts',
      hooks: {
        afterChange: [
          async ({ doc, previousDoc, operation }) => {
            if (['create', 'update', 'delete'].includes(operation)) {
              // Инвалидация кэша при изменении
              await redisCache.invalidate('posts:*')

              // Инвалидация homepage кэша
              await redisCache.del('home:posts')
            }
            return doc
          },
        ],
      },
    },
  ],
})
```

## Оптимизация фронтенда

### 1. Server-Side Rendering оптимизация

```typescript
// pages/index.tsx
import { GetStaticProps } from 'next'
import getPayload from '../payload'

export const getStaticProps: GetStaticProps = async () => {
  const payload = await getPayload()

  // Использование ISR с кэшированием
  const posts = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 10,
  })

  return {
    props: {
      posts,
    },
    revalidate: 60, // ISR кэш на 60 секунд
  }
}
```

### 2. Client-Side оптимизация

```typescript
// hooks/usePayloadQuery.ts
import { useState, useEffect } from 'react'

export function usePayloadQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cacheTime?: number
    staleTime?: number
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { cacheTime = 300000, staleTime = 0 } = options

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Проверка кэша
        const cached = localStorage.getItem(key)
        const cachedData = cached ? JSON.parse(cached) : null

        if (cachedData && Date.now() - cachedData.timestamp < staleTime) {
          setData(cachedData.data)
          setLoading(false)
          return
        }

        const freshData = await fetcher()

        // Сохранение в кэш
        localStorage.setItem(key, JSON.stringify({
          data: freshData,
          timestamp: Date.now(),
        }))

        setData(freshData)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [key, staleTime])

  return { data, loading, error }
}
```

### 3. Изображения и файлы

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

## Оптимизация Payload Configuration

### 1. Lazy Loading коллекций

```typescript
// payload.config.ts
export default buildConfig({
  admin: {
    webpack: (config) => ({
      ...config,
      externals: [...(config.externals || []), 'sharp'],
    }),
  },
  collections: [
    {
      slug: 'products',
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'price', 'category', 'status'],
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        // Избегайте слишком большого количества полей
        // Разделяйте сложные структуры на отдельные коллекции
      ],
    },
  ],
})
```

### 2. Оптимизация запросов в Local API

```typescript
// Efficient Local API usage
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getPostsOptimized() {
  const payload = await getPayload({ config })

  // Используйте транзакции для множественных операций
  return await payload.db.transaction(async (db) => {
    const posts = await payload.find({
      collection: 'posts',
      where: { status: 'published' },
      sort: '-publishedAt',
      limit: 20,
      depth: 1, // Ограничьте глубину популяции
    })

    const popularTags = await payload.find({
      collection: 'tags',
      where: {
        'posts.post': { exists: true },
      },
      limit: 10,
      depth: 0,
    })

    return {
      posts,
      popularTags,
    }
  })
}
```

## Мониторинг и алерты

### 1. Web Vitals

```typescript
// components/WebVitals.tsx
import { useEffect } from 'react'

export function reportWebVitals(metric: any) {
  // Отправка метрик в аналитику
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    })
  }
}

export function WebVitals() {
  useEffect(() => {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals)
      getFID(reportWebVitals)
      getFCP(reportWebVitals)
      getLCP(reportWebVitals)
      getTTFB(reportWebVitals)
    })
  }, [])

  return null
}
```

### 2. Custom Performance Metrics

```typescript
// pages/api/performance-metrics.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { metric } = req.body

  // Сохранение метрик в базу данных или отправка в мониторинг
  console.log('Performance metric:', {
    ...metric,
    timestamp: new Date().toISOString(),
  })

  // Установка алертов для критических метрик
  if (metric.name === 'LCP' && metric.value > 2500) {
    console.warn('Large Contentful Paint is slow:', metric.value)
  }

  if (metric.name === 'FID' && metric.value > 100) {
    console.warn('First Input Delay is high:', metric.value)
  }

  res.status(200).json({ success: true })
}
```

## Best Practices

### 1. Database Optimization
- Создавайте индексы для частых запросов
- Используйте connection pooling
- Избегайте N+1 запросов
- Оптимизируйте структуру данных

### 2. Caching Strategy
- Многоуровневое кэширование (browser, CDN, server, database)
- Используйте Redis для распределенного кэша
- Инвалидируйте кэш при изменении данных
- Настраивайте appropriate TTL

### 3. API Optimization
- Включайте сжатие gzip/brotli
- Используйте HTTP кэширование
- Оптимизируйте размер ответов
- Реализуйте пагинацию

### 4. Frontend Performance
- Оптимизируйте изображения
- Используйте code splitting
- Реализуйте lazy loading
- Оптимизируйте CSS и JavaScript

### 5. Monitoring
- Отслеживайте ключевые метрики
- Настраивайте алерты
- Анализируйте performance bottlenecks
- Регулярно проводите performance audits

## Performance Testing

### Load Testing Script

```javascript
// load-test.js
import { check } from 'k6'
import http from 'k6/http'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests under 1.5s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  },
}

export default function() {
  const res = http.get('https://your-payload-app.com/api/posts')
  check(res, {
    'status was 200': (r) => r.status == 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
}
```

## Production Checklist

- [ ] Database indexes созданы
- [ ] Кэширование настроено
- [ ] CDN включен
- [ ] Сжатие включено
- [ ] Мониторинг работает
- [ ] Алерты настроены
- [ ] Load testing выполнен
- [ ] Images оптимизированы
- [ ] Code splitting включен
- [ ] Performance budget соблюден