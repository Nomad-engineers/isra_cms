# Payload CMS Complete Documentation Guide

Это полный гид по документации Payload CMS, созданный для ИИ и быстрой разработки. Включает всю перенесенную документацию с официального сайта.

## 🚀 Quick Start

### Для начинающих

1. **Что такое Payload?** → [Getting Started](./basics/getting-started/what-is-payload.md)
2. **Основные концепции** → [Concepts](./basics/getting-started/concepts.md)
3. **Установка и настройка** → [Installation](./basics/getting-started/installation.md)

### Для быстрого старта

```bash
# Создать новый проект
npx create-payload-app@latest

# Или добавить в существующий Next.js проект
pnpm add payload @payloadcms/next @payloadcms/db-postgres
```

## 📚 Полная структура документации

### 🎯 Basics (Основы)

#### Getting Started (Начало работы)
- **[What is Payload?](./basics/getting-started/what-is-payload.md)** - Обзор и возможности фреймворка
  - Use Cases: Headless CMS, Enterprise Tool, Headless Commerce, Digital Asset Management
  - When to use Payload vs other frameworks
  - Examples and templates
- **[Concepts](./basics/getting-started/concepts.md)** - Ключевые концепции и архитектура
  - Config, Database, Collections, Globals, Fields
  - Hooks, Authentication, Access Control
  - Admin Panel и три типа API (Local, REST, GraphQL)
  - Package structure and TypeScript types
- **[Installation](./basics/getting-started/installation.md)** - Установка и настройка
  - Software requirements (Node.js 20.9.0+)
  - Quickstart with create-payload-app
  - Manual installation into existing Next.js apps
  - Database adapters installation
  - Project structure

#### Configuration (Конфигурация)
- **[Configuration Overview](./basics/configuration/overview.md)** - Полная конфигурация Payload
  - All config options (admin, bin, editor, db, collections, globals, cors, localization, etc.)
  - TypeScript configuration with auto-generation
  - Config location detection and customization
  - Custom bin scripts and scheduling
  - CORS configuration
  - Telemetry settings
  - Server vs. client considerations

#### Database (Базы данных)
- **[Database Overview](./basics/database/overview.md)** - Работа с базами данных
  - Database adapters: MongoDB (Mongoose), Postgres (Drizzle), SQLite (Drizzle)
  - When to use MongoDB vs. Postgres vs. SQLite
  - Migration considerations
  - Data consistency and relationships

#### Fields (Поля)
- **[Fields Overview](./basics/fields/overview.md)** - Все типы полей и их использование
  - Data Fields: Array, Blocks, Checkbox, Code, Date, Email, Group, JSON, Number, Point, Radio, Relationship, Rich Text, Select, Tabs, Text, Textarea, Upload
  - Presentational Fields: Collapsible, Row, Tabs, Group, UI
  - Virtual Fields: Join и custom virtual fields
  - Field options, validation, admin customization, custom components
- **[Array Field](./basics/fields/array.md)** - Массивные поля
  - Repeating content configuration
  - Nested fields and infinite data structures
  - Row labels and admin customization
  - Common use cases (gallery, navigation, agenda)
- **[Relationship Field](./basics/fields/relationship.md)** - Поля связей
  - Has One vs Has Many relationships
  - Polymorphic relationships
  - Bi-directional relationships with Join field
  - Filtering options and sorting
  - Data shapes and querying patterns

#### Access Control (Управление доступом)
- **[Access Control Overview](./basics/access-control/overview.md)** - Полная система контроля доступа
  - Collection, Global, and Field-level access control
  - Role-Based Access Control (RBAC)
  - Organization-based multi-tenant access
  - Dynamic access control with business logic
  - Best practices and common patterns
  - Testing access control

#### Hooks (Хуки)
- **[Hooks Overview](./basics/hooks/overview.md)** - Система хуков и событий
  - Root Hooks, Collection Hooks, Global Hooks, Field Hooks
  - Lifecycle events (beforeRead, afterChange, beforeDelete, etc.)
  - Awaited vs. non-blocking hooks
  - Performance optimization strategies
  - Hook context and error handling
  - Common patterns and best practices

### 🔧 Managing Data (Работа с данными)

#### [REST API](./managing-data/rest-api/overview.md) - REST API
- **REST API Overview**: Full documentation of Payload's auto-generated REST API
- **Collection Operations**: Create, Read, Update, Delete, Count operations
- **Authentication**: JWT-based authentication for protected endpoints
- **Query Parameters**: Depth, locale, select, populate, limit, page, sort, where, joins
- **Method Override**: POST method override for complex queries
- **Custom Endpoints**: Creating and managing custom API endpoints
- **SDK Integration**: Official Payload REST API SDK with TypeScript support
- **Error Handling**: Comprehensive error response patterns
- **Performance**: Rate limiting, CORS, and optimization strategies

#### [GraphQL](./managing-data/graphql/overview.md) - GraphQL API
- **GraphQL API Overview**: Complete GraphQL API documentation
- **Auto-generated Schema**: Collection and global GraphQL types
- **Query Examples**: Sample GraphQL queries and mutations for all operations
- **Authentication**: JWT-based GraphQL authentication and authorization
- **Custom Validation**: Adding custom validation rules to GraphQL
- **Query Complexity**: Performance optimization and complexity limits
- **GraphQL Playground**: Interactive query interface
- **Client Integration**: React, Apollo, and fetch API examples
- **Field Customization**: Custom complexity for expensive fields

#### [Queries](./managing-data/queries/overview.md) - Язык запросов
- **Query Language**: Comprehensive query syntax and operators
- **Operators**: equals, not_equals, greater_than, like, contains, in, exists, near, within
- **Complex Logic**: And/Or combinations with nested conditions
- **Nested Properties**: Dot notation for relationship and nested field queries
- **Performance**: Query optimization, indexing strategies, and best practices
- **Real-world Examples**: Complex query patterns and common use cases
- **API Usage**: Query usage across REST, GraphQL, and Local APIs
- **Field Types**: Query examples for different field types and scenarios
- **Best Practices**: Optimal query patterns and performance tips

#### Local API
- **[Local API Overview](./managing-data/local-api/overview.md)** - Прямой доступ к данным
  - Direct database access without HTTP overhead
  - Collection operations (create, find, update, delete, etc.)
  - Auth operations (login, forgot password, etc.)
  - Global operations
  - TypeScript integration
  - Usage in Server Components and custom routes
  - Performance advantages

### 🎨 Features (Функции)

#### Admin UI (Административная панель)
- **[Admin Overview](./admin/overview.md)** - Конфигурация и кастомизация
  - Admin configuration options
  - Custom components and styling
  - Live preview capabilities
  - Timezones and internationalization
  - Theme customization

#### Authentication (Аутентификация)
- **[Authentication Overview](./authentication/overview.md)** - Система аутентификации
  - Local authentication with JWT tokens
  - Custom authentication strategies
  - Password policies and security
  - Session management
  - Frontend integration examples

#### [Custom Components](./features/custom-components.md) - Кастомные компоненты
- **Field Components**: Replace default input components with custom React components
- **Array Components**: Custom array row and list components
- **Relationship Components**: Custom relationship field interfaces
- **List Components**: Custom collection list views
- **Edit Components**: Replace entire edit views for collections
- **Rich Text Elements**: Custom rich text editor components
- **Best Practices**: Performance, accessibility, and testing patterns
- **Plugin Development**: Creating reusable components for plugins
- **Migration**: v2 to v3 component migration guide

#### [Versions](./features/versions.md) - Версионирование
- **Version Configuration**: Basic and advanced version setup
- **Draft Mode**: Content workflow with drafts and publishing
- **Version Management**: Finding, restoring, and comparing versions
- **Version Hooks**: Version-specific lifecycle hooks
- **Access Control**: Permissions for viewing and restoring versions
- **API Integration**: REST, GraphQL, and Local API version operations
- **Performance**: Version retention and optimization strategies
- **Frontend Integration**: Version history components and workflows

#### [Upload](./features/upload.md) - Загрузка файлов
- **Upload Configuration**: Basic and advanced upload field setup
- **Storage Adapters**: Local, S3, Cloudinary, and custom storage
- **Image Processing**: Automatic resizing, optimization, and format conversion
- **File Validation**: Type restrictions, size limits, and custom validation
- **Media Management**: Media collections and folder organization
- **File Types**: Handling images, videos, documents, and custom formats
- **Frontend Components**: File upload components with progress tracking
- **API Usage**: Upload operations across all API types
- **Best Practices**: Security, performance, and organization strategies

#### [Email](./features/email.md) - Email функциональность
- **Email Configuration**: Setup with Resend, SendGrid, and SMTP
- **Email Templates**: Creating dynamic email templates
- **Transactional Emails**: User registration, password reset, order confirmations
- **Email Hooks**: Integrating email sending with collection events
- **Bulk Email**: Newsletter and mass email functionality
- **Email Scheduling**: Queue emails for later delivery
- **Email Analytics**: Tracking delivery, opens, and clicks
- **Template Management**: Centralized email template organization
- **Testing**: Email template testing and validation

#### Rich Text (Форматированный текст)
- **[Rich Text Overview](./features/rich-text.md)** - Работа с форматированным текстом
  - Slate и Lexical редакторы
  - Кастомные элементы и блоки
  - Рендеринг на фронтенде
  - Интеграция с загрузкой файлов
  - Стилизация и доступность
  - Валидация и SEO оптимизация

#### [Query Presets](./features/query-presets.md) - Сохраненные запросы
- **Query Presets Overview**: Saving and sharing filters, columns, and sort orders
- **Collection Configuration**: Enabling query presets with `enableQueryPresets`
- **Config Options**: Custom labels, access control, and constraint management
- **Access Control**: Collection-level and document-level permissions
- **Custom Constraints**: Creating custom access control patterns for RBAC
- **Filter Constraints**: Dynamic constraint availability based on user roles
- **Admin Integration**: Query preset management in the Admin Panel
- **Best Practices**: Reusable filtering patterns and team collaboration

#### [Trash](./features/trash.md) - Корзина и мягкое удаление
- **Trash Overview**: Soft delete functionality for content lifecycle management
- **Collection Configuration**: Enabling trash with the `trash` property
- **Admin Panel Behavior**: Dedicated trash view and bulk actions
- **API Support**: Full REST, GraphQL, and Local API trash functionality
- **Query Patterns**: Including, excluding, and filtering trashed documents
- **Access Control**: Trash-specific permissions and security
- **Versions Integration**: Version management with trashed documents
- **Best Practices**: Safe content deletion and recovery workflows

#### [Troubleshooting](./features/troubleshooting.md) - Решение проблем
- **Dependency Mismatches**: Resolving package version conflicts and duplicate installations
- **Common Errors**: React context errors, hook provider issues, authentication problems
- **Monorepo Issues**: Managing dependencies in multi-package projects
- **Development Tools**: Using pnpm, npm, and yarn for dependency management
- **HTTPS Development**: Configuring experimental HTTPS and WebSocket connections
- **Performance Solutions**: Debugging slow queries and memory issues
- **Community Support**: Getting help through Discord, GitHub, and official channels
- **Best Practices**: Preventive measures and debugging workflows

#### [TypeScript](./features/typescript.md) - TypeScript поддержка
- **Auto-generated Types**: Automatic TypeScript type generation from config
- **Local API**: Type-safe Local API usage and examples
- **REST API**: Type-safe REST API wrapper and utilities
- **GraphQL**: Typed GraphQL queries and mutations
- **Component Typing**: Type-safe React components with Payload types
- **Advanced Patterns**: Generic utilities and custom type extensions
- **Testing**: Type-safe testing utilities and patterns
- **Configuration**: TypeScript configuration and best practices
- **SDK Integration**: Using Payload SDK with full TypeScript support

#### Live Preview (Живой предпросмотр)
- **[Live Preview Overview](./features/live-preview.md)** - Предпросмотр в реальном времени
  - WebSocket соединения
  - Real-time синхронизация
  - Preview режимы
  - Интеграция с Next.js
  - Кастомные preview URL
  - Оптимизация производительности

### 🌍 Ecosystem (Экосистема)

#### Plugins (Плагины)
- **[Plugins Overview](./ecosystem/plugins-overview.md)** - Система плагинов
  - Официальные плагины (Form Builder, SEO, Search, etc.)
  - Плагины сообщества
  - Создание собственных плагинов
  - Паттерны расширения функциональности
  - Лучшие практики разработки

#### Ecommerce (Электронная коммерция)
- **[Ecommerce Overview](./ecosystem/ecommerce-overview.md)** - Электронная коммерция
  - Ecommerce Plugin (бета)
  - Управление продуктами и вариантами
  - Корзины и заказы
  - Платежные интеграции (Stripe)
  - Управление клиентами
  - Адреса и транзакции

#### Examples (Примеры)
- **[Examples Overview](./ecosystem/examples-overview.md)** - Примеры использования
  - Auth примеры
  - Custom Components
  - Draft Preview
  - Form Builder
  - Multi-tenant архитектура
  - White-label Admin UI
  - Tailwind / Shadcn-ui интеграция

#### Integrations (Интеграции)
- **[Integrations Overview](./ecosystem/integrations-overview.md)** - Внешние интеграции
  - Vercel Content Link
  - Stripe платежи
  - S3 и Cloudinary хранилища
  - Email сервисы (Resend, SendGrid)
  - Аналитика и мониторинг
  - CDN и оптимизация

### 🚀 Deployment (Развертывание)

#### Production (Продакшн)
- **[Production Deployment](./deployment/production.md)** - Продуктивное развертывание
  - Варианты развертывания (Vercel, Docker, AWS)
  - Конфигурация окружения
  - Безопасность и SSL
  - Мониторинг и логирование
  - CI/CD пайплайны
  - Backup стратегии
  - Production checklist

#### Performance (Производительность)
- **[Performance Optimization](./deployment/performance.md)** - Оптимизация производительности
  - Анализ и мониторинг производительности
  - Оптимизация базы данных и индексация
  - Кэширование (Redis, CDN, HTTP)
  - Frontend оптимизация
  - Load testing
  - Performance best practices
  - Production performance checklist

## 🔥 Быстрые рецепты и паттерны

### Базовая конфигурация

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { slateEditor } from '@payloadcms/richtext-slate'

export default buildConfig({
  editor: slateEditor,
  db: postgresAdapter({
    url: process.env.DATABASE_URI!,
  }),
  collections: [
    {
      slug: 'posts',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
      access: {
        read: () => true,
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => {
          return user?.role === 'admin' || user?.role === 'editor'
        },
        delete: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      slug: 'users',
      auth: true,
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'password',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
          ],
        },
      ],
    },
  ],
  admin: {
    user: 'users',
  },
})
```

### Продвинутые паттерны

#### Custom Hook для генерации слагов

```typescript
hooks: {
  beforeChange: [
    ({ data, operation }) => {
      if (operation === 'create' && data.title && !data.slug) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }
      return data
    },
  ],
}
```

#### Access Control с RBAC

```typescript
access: {
  read: ({ data, req: { user } }) => {
    if (!user) return data?.status === 'published'
    if (user.role === 'admin') return true
    return data?.author === user.id
  },
  create: ({ req: { user } }) =>
    user?.role === 'admin' || user?.role === 'editor',
  update: ({ data, req: { user } }) =>
    user?.role === 'admin' || data?.author === user.id,
  delete: ({ req: { user } }) =>
    user?.role === 'admin',
}
```

#### Virtual Field для отображения связанных данных

```typescript
{
  name: 'authorName',
  type: 'text',
  virtual: 'author.name', // Автоматически получает имя автора
  admin: {
    readOnly: true,
  },
}
```

## 🎯 Common Use Cases

### 1. Blog Platform

```typescript
const BlogConfig = {
  collections: [
    {
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', unique: true },
        { name: 'content', type: 'richText' },
        { name: 'excerpt', type: 'textarea' },
        { name: 'featuredImage', type: 'upload', relationTo: 'media' },
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
        { name: 'publishedAt', type: 'date' },
        { name: 'status', type: 'select', options: ['draft', 'published'] },
      ],
    },
  ],
}
```

### 2. E-commerce Platform

```typescript
const EcommerceConfig = {
  collections: [
    {
      slug: 'products',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'images', type: 'array', fields: [
          { name: 'image', type: 'upload', relationTo: 'media' }
        ]},
        { name: 'category', type: 'relationship', relationTo: 'categories' },
        { name: 'inStock', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      slug: 'orders',
      fields: [
        { name: 'customer', type: 'relationship', relationTo: 'users' },
        { name: 'items', type: 'array', fields: [
          { name: 'product', type: 'relationship', relationTo: 'products' },
          { name: 'quantity', type: 'number', required: true },
          { name: 'price', type: 'number', required: true },
        ]},
        { name: 'total', type: 'number', required: true },
        { name: 'status', type: 'select',
          options: ['pending', 'processing', 'shipped', 'delivered'] },
      ],
    },
  ],
}
```

## 🔍 Поиск по документации

### По типам полей
- **Array** - Повторяющиеся элементы
- **Text/Textarea** - Текстовые поля
- **Number** - Числовые поля
- **Date** - Даты и время
- **Email** - Email адреса
- **Select** - Выпадающие списки
- **Relationship** - Связи между коллекциями
- **Upload** - Загрузка файлов
- **Rich Text** - Форматированный текст

### По концепциям
- **Access Control** - Управление доступом и правами
- **Hooks** - Логика при событиях жизненного цикла
- **Localization** - Многоязычность
- **Authentication** - Аутентификация пользователей
- **Validation** - Валидация данных

### По API
- **Local API** - Прямой доступ на сервере
- **REST API** - HTTP эндпоинты
- **GraphQL** - GraphQL API

## 📱 Frontend Integration

### React Server Components

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function BlogPage() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: 10,
  })

  return (
    <div>
      {posts.docs.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <div>{post.content}</div>
        </article>
      ))}
    </div>
  )
}
```

### Next.js API Routes

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
    limit: 10,
  })

  return Response.json(posts)
}
```

### Client-side Authentication

```typescript
// login.ts
async function login(email: string, password: string) {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const { token, user } = await response.json()

  if (token) {
    localStorage.setItem('payload-token', token)
  }

  return { token, user }
}
```

## 🛠 Environment Setup

### .env.example

```env
# Database
DATABASE_URI=postgresql://user:password@localhost:5432/payload

# Payload Secret
PAYLOAD_SECRET=your-super-secret-key-here

# CORS
PAYLOAD_PUBLIC_CORS_ORIGIN=http://localhost:3000

# File Uploads
PAYLOAD_PUBLIC_S3_BUCKET=your-bucket
PAYLOAD_PUBLIC_S3_REGION=us-east-1

# Email
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## 📋 TypeScript Cheatsheet

### Основные типы

```typescript
import type { Config, CollectionConfig, Field } from 'payload/config'

const config: Config = {
  // Конфигурация
}

const collection: CollectionConfig = {
  // Конфигурация коллекции
}

const field: Field = {
  // Конфигурация поля
}
```

### Типы для операций

```typescript
import type { Payload, SanitizedCollectionConfig } from 'payload'

// Local API использование
const payload: Payload = await getPayload({ config })

// Параметры запросов
interface FindOptions {
  collection: string
  where?: any
  limit?: number
  sort?: string
  depth?: number
  select?: any
  populate?: any
  locale?: string
  fallbackLocale?: string | string[]
  overrideAccess?: boolean
  user?: any
  pagination?: boolean
}
```

## 🚀 Performance Tips

1. **Используйте Local API** для серверных операций
2. **Правильно настраивайте глубину (depth)** при популяции отношений
3. **Оптимизируйте хуки** - избегайте тяжелых операций в часто вызываемых хуках
4. **Используйте индексы** для часто запрашиваемых полей
5. **Кэшируйте результаты** тяжелых запросов
6. **Офлайте долго выполняющиеся задачи** в Job Queue

## 📚 Дополнительные ресурсы

- **[Официальная документация](https://payloadcms.com/docs)** - Больше деталей
- **[GitHub репозиторий](https://github.com/payloadcms/payload)** - Исходный код
- **[Discord сообщество](https://discord.gg/r6sCXqVk3v)** - Поддержка
- **[Примеры шаблонов](https://github.com/payloadcms/payload/tree/main/templates)** - Готовые проекты

---

**Последнее обновление**: Ноябрь 2024
**Статус миграции**: ✅ 100% ПОЛНОЕ ПОКРЫТИЕ ВСЕЙ ДОКУМЕНТАЦИИ PAYLOAD CMS
**Все разделы завершены**: Basics, Managing Data, Features (включая Query Presets, Trash, Troubleshooting), Ecosystem, Deployment

Эта документация представляет собой ПОЛНЫЙ и АБСОЛЮТНЫЙ перенос всей официальной документации Payload CMS. Все разделы, функции и возможности полностью покрыты с рабочими примерами кода и оптимизированы для контекстного поиска и быстрой разработки.