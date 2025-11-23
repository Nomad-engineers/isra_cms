# Live Preview (Живой предпросмотр)

Live Preview позволяет редакторам видеть изменения контента в реальном времени на фронтенде сайта во время редактирования в административной панели Payload. Эта функциональность значительно улучшает пользовательский опыт и ускоряет процесс создания контента.

## Как работает Live Preview

Live Preview использует WebSocket соединение для синхронизации изменений между административной панелью и фронтендом в реальном времени. При редактировании контента в админ-панели изменения мгновенно отображаются на предпросмотре сайта.

## Базовая настройка

### 1. Конфигурация Payload

```typescript
// payload.config.ts
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    livePreview: {
      // URL для предпросмотра
      url: 'http://localhost:3000/api/preview',
    },
  },
  collections: [
    {
      slug: 'pages',
      admin: {
        livePreview: {
          // Кастомный URL для конкретной коллекции
          url: ({ data }) => {
            return `http://localhost:3000/api/preview?slug=${data.slug}`
          },
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'content',
          type: 'richText',
        },
      ],
    },
  ],
})
```

### 2. Next.js API маршрут для предпросмотра

```typescript
// pages/api/preview.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { setPreviewData, previewData } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: NextApiRequest) {
  const { searchParams } = new URL(req.url!)
  const slug = searchParams.get('slug')
  const token = searchParams.get('token')

  // Валидация токена
  if (token !== process.env.PAYLOAD_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  // Установка preview данных
  const draftData = await getDraftData(slug)
  setPreviewData(req, draftData)

  // Редирект на страницу с предпросмотром
  redirect(`/${slug}?preview=true`)
}

async function getDraftData(slug: string) {
  // Получение черновика данных из Payload
  const payload = await getPayload()

  try {
    const doc = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })

    return {
      doc: doc.docs[0],
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Error getting draft data:', error)
    return null
  }
}
```

### 3. Компонент для отображения предпросмотра

```typescript
// components/PreviewWrapper.tsx
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

interface PreviewWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export async function PreviewWrapper({
  children,
  fallback
}: PreviewWrapperProps) {
  const { isEnabled } = draftMode()

  if (!isEnabled) {
    return fallback || children
  }

  return children
}
```

## Продвинутая настройка

### Кастомные поля для Live Preview

```typescript
// payload.config.ts
export default buildConfig({
  collections: [
    {
      slug: 'posts',
      admin: {
        livePreview: {
          url: ({ data }) => {
            const query = new URLSearchParams({
              slug: data.slug,
              category: data.category || '',
              tags: data.tags?.join(',') || '',
            })
            return `http://localhost:3000/api/preview?${query.toString()}`
          },
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            livePreview: {
              // Показывать изменения в real-time
              realTime: true,
            },
          },
        },
        {
          name: 'featuredImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            livePreview: {
              // Обновлять предпросмотр при смене изображения
              updateOn: 'change',
            },
          },
        },
      ],
    },
  ],
})
```

### WebSocket соединение

```typescript
// utils/previewSocket.ts
class PreviewSocket {
  private socket: WebSocket | null = null
  private callbacks: Map<string, Function[]> = new Map()

  connect(url: string) {
    this.socket = new WebSocket(url)

    this.socket.onopen = () => {
      console.log('Preview socket connected')
    }

    this.socket.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      this.emit(type, data)
    }

    this.socket.onclose = () => {
      console.log('Preview socket disconnected')
      // Автоматическое переподключение
      setTimeout(() => this.connect(url), 5000)
    }
  }

  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

export const previewSocket = new PreviewSocket()
```

## Frontend интеграция

### React компонент для Live Preview

```typescript
// components/LivePreview.tsx
'use client'

import { useEffect, useState } from 'react'
import { previewSocket } from '../utils/previewSocket'

interface LivePreviewProps {
  slug: string
  initialData?: any
}

export function LivePreview({ slug, initialData }: LivePreviewProps) {
  const [data, setData] = useState(initialData)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const wsUrl = `ws://localhost:3000/api/preview-socket?slug=${slug}`
    previewSocket.connect(wsUrl)

    previewSocket.on('connected', () => {
      setIsConnected(true)
    })

    previewSocket.on('data-update', (newData) => {
      setData(newData)
    })

    previewSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      previewSocket.disconnect()
    }
  }, [slug])

  if (!isConnected) {
    return (
      <div className="preview-status">
        Connecting to preview...
      </div>
    )
  }

  return (
    <div className="live-preview">
      <div className="preview-header">
        <div className="preview-indicator">
          <span className="preview-dot"></span>
          Live Preview Active
        </div>
      </div>

      <div className="preview-content">
        {/* Рендеринг контента с актуальными данными */}
        <PageContent data={data} />
      </div>
    </div>
  )
}
```

### Хук для использования предпросмотра

```typescript
// hooks/usePreview.ts
import { useEffect, useState } from 'react'
import { draftMode } from 'next/headers'

export function usePreview<T>(slug: string, initialData?: T) {
  const [data, setData] = useState<T | undefined>(initialData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const updatePreviewData = async () => {
      if (typeof window !== 'undefined' && window.location.search.includes('preview=true')) {
        setIsLoading(true)

        try {
          const response = await fetch(`/api/preview-data?slug=${slug}`)
          if (response.ok) {
            const newData = await response.json()
            setData(newData)
          }
        } catch (error) {
          console.error('Error updating preview:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    // Обновление данных при изменении URL
    const handlePopState = updatePreviewData
    window.addEventListener('popstate', handlePopState)

    // Интервальное обновление для real-time предпросмотра
    const interval = setInterval(updatePreviewData, 2000)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      clearInterval(interval)
    }
  }, [slug])

  return { data, isLoading }
}
```

## Оптимизация производительности

### Кэширование предпросмотра

```typescript
// utils/previewCache.ts
class PreviewCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly TTL = 5000 // 5 секунд

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)

    if (!item) return null

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  invalidate(key: string) {
    this.cache.delete(key)
  }
}

export const previewCache = new PreviewCache()
```

### Debounce для обновлений

```typescript
// utils/debounce.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}
```

## Лучшие практики

### 1. Безопасность
- Всегда валидируйте preview токены
- Ограничивайте доступ к preview функциональности
- Используйте HTTPS для WebSocket соединений

### 2. Производительность
- Кэшируйте предпросмотр данных
- Используйте debouncing для частых обновлений
- Оптимизируйте размер передаваемых данных

### 3. UX/UI
- Показывайте статус соединения
- Предоставляйте fallback для disconnected state
- Используйте индикаторы загрузки

### 4. Разработка
- Тестируйте preview функциональность
- Используйте environment variables для конфигурации
- Реализуйте proper error handling

## Troubleshooting

### Частые проблемы

1. **WebSocket не подключается**
   - Проверьте конфигурацию CORS
   - Убедитесь, что порт доступен
   - Проверьте firewall настройки

2. **Предпросмотр не обновляется**
   - Проверьте токен доступа
   - Убедитесь, что данные отправляются правильно
   - Проверьте консоль ошибок

3. **Производительность проблемы**
   - Оптимизируйте размер данных
   - Используйте кэширование
   - Уменьшите частоту обновлений

4. **Mobile compatibility**
   - Тестируйте на мобильных устройствах
   - Оптимизируйте для touch интерфейсов
   - Проверьте battery consumption

## Пример полной реализации

```typescript
// pages/api/preview/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { setPreviewData } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: NextApiRequest) {
  const searchParams = new URL(req.url!).searchParams
  const slug = searchParams.get('slug')
  const token = searchParams.get('token')
  const collection = searchParams.get('collection') || 'pages'

  if (!slug || !token) {
    return new Response('Missing slug or token', { status: 400 })
  }

  if (token !== process.env.PAYLOAD_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  try {
    const payload = await getPayload()
    const doc = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })

    if (!doc.docs[0]) {
      return new Response('Document not found', { status: 404 })
    }

    setPreviewData(req, {
      doc: doc.docs[0],
      collection,
      timestamp: Date.now(),
    })

    redirect(`/${collection}/${slug}?preview=true`)
  } catch (error) {
    console.error('Preview error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
```

Live Preview является мощной функцией, которая значительно улучшает процесс создания контента и повышает эффективность работы редакторов.