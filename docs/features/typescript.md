# TypeScript

Payload provides comprehensive TypeScript support, including auto-generated types, full type safety throughout your application, and excellent developer experience with intelligent code completion and error checking.

## Overview

TypeScript support in Payload enables you to:

- **Auto-generated Types**: Automatically generate types from your Payload config
- **Full Type Safety**: Type-safe APIs, hooks, and components
- **IntelliSense**: Intelligent code completion and documentation
- **Compile-time Validation**: Catch errors before runtime
- **Refactoring Support**: Safely rename and refactor your code
- **IDE Integration**: Full support in VS Code, WebStorm, and other IDEs

## Setup and Configuration

### Basic TypeScript Setup

```typescript
// payload-types.ts (auto-generated)
export interface Config {
  collections: {
    posts: Post
    users: User
    media: Media
  }
  globals: {
    'site-settings': SiteSettings
    'header': Header
  }
}

export interface Post {
  id: string
  title: string
  content?: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}
```

### Generating Types

Payload automatically generates TypeScript types from your configuration. You can trigger type generation by:

1. **Running Payload**: Types are generated automatically when Payload starts
2. **Manual Generation**: Use the CLI command to generate types
3. **Watch Mode**: Types update as you modify your config

```bash
# Generate types manually
npx payload generate:types

# Generate types with specific output path
npx payload generate:types --output ./src/types/payload-types.ts
```

## Using Generated Types

### Local API with Types

```typescript
import type { Payload, GeneratedTypes } from 'payload'
import getPayload from './payload'

// Use generated types with Local API
const payload = await getPayload()

const createPost = async (postData: GeneratedTypes['collections']['posts']) => {
  const post = await payload.create({
    collection: 'posts',
    data: postData,
    depth: 2
  })
  return post
}

// Type-safe query building
const findPosts = async (where: GeneratedTypes['collections']['posts']['where']) => {
  const posts = await payload.find({
    collection: 'posts',
    where,
    depth: 1,
    limit: 10
  })
  return posts
}

// Usage with full type inference
const result = await findPosts({
  status: {
    equals: 'published'
  }
})
```

### REST API with Types

```typescript
import type { GeneratedTypes } from 'payload/types'

interface ApiResponse<T> {
  docs: T[]
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
  page: number
  totalPages: number
  totalDocs: number
}

// Type-safe fetch wrapper
class PayloadAPI {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async find<T extends keyof GeneratedTypes['collections']>(
    collection: T,
    params?: {
      where?: GeneratedTypes['collections'][T]['where']
      limit?: number
      page?: number
      sort?: string
      depth?: number
    }
  ): Promise<ApiResponse<GeneratedTypes['collections'][T]>> {
    const response = await fetch(`${this.baseURL}/api/${collection}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return response.json()
  }

  async create<T extends keyof GeneratedTypes['collections']>(
    collection: T,
    data: GeneratedTypes['collections'][T]['create']
  ): Promise<GeneratedTypes['collections'][T]> {
    const response = await fetch(`${this.baseURL}/api/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    return response.json()
  }
}

// Usage
const api = new PayloadAPI('http://localhost:3000')

const posts = await api.find('posts', {
  where: {
    status: { equals: 'published' }
  },
  limit: 10
})

const newPost = await api.create('posts', {
  title: 'My New Post',
  content: 'Post content here',
  status: 'draft'
})
```

### GraphQL with Types

```typescript
import { gql, TypedDocumentNode } from '@apollo/client'
import type { GeneratedTypes } from 'payload/types'

// Type-safe GraphQL queries
const GET_POSTS: TypedDocumentNode<{
  Posts: {
    docs: GeneratedTypes['collections']['posts'][]
    totalDocs: number
  }
}> = gql`
  query GetPosts($where: PostsWhereInput, $limit: Int) {
    Posts(where: $where, limit: $limit) {
      docs {
        id
        title
        content
        status
        createdAt
      }
      totalDocs
    }
  }
`

// Usage with Apollo Client
const { data, loading, error } = useQuery(GET_POSTS, {
  variables: {
    where: {
      status: { equals: 'published' }
    },
    limit: 10
  }
})
```

## Component Typing

### React Components with Payload Types

```typescript
import React from 'react'
import type { GeneratedTypes } from 'payload/types'

interface PostCardProps {
  post: GeneratedTypes['collections']['posts']
  onEdit?: (id: string) => void
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit }) => {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <span className={`status status-${post.status}`}>
        {post.status}
      </span>
      {onEdit && (
        <button onClick={() => onEdit(post.id)}>
          Edit
        </button>
      )}
    </div>
  )
}

// Usage
const PostList: React.FC = () => {
  const [posts, setPosts] = useState<GeneratedTypes['collections']['posts'][]>([])

  const handleEdit = (id: string) => {
    // Handle edit logic
  }

  return (
    <div>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onEdit={handleEdit}
        />
      ))}
    </div>
  )
}
```

### Form Components

```typescript
import React, { useState } from 'react'
import type { GeneratedTypes } from 'payload/types'

interface PostFormProps {
  initialData?: Partial<GeneratedTypes['collections']['posts']>
  onSubmit: (data: GeneratedTypes['collections']['posts']['create']) => void
}

const PostForm: React.FC<PostFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<GeneratedTypes['collections']['posts']['create']>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    status: initialData?.status || 'draft'
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
        />
      </div>

      <div>
        <label>Content</label>
        <textarea
          value={formData.content || ''}
          onChange={(e) => handleChange('content', e.target.value)}
        />
      </div>

      <div>
        <label>Status</label>
        <select
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as 'draft' | 'published')}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <button type="submit">Save Post</button>
    </form>
  )
}
```

## Advanced TypeScript Patterns

### Custom Type Extensions

```typescript
// types/payload-extensions.ts
import type { GeneratedTypes } from 'payload/types'

// Extend generated types with custom properties
declare module 'payload/types' {
  export interface GeneratedTypes {
    collections: {
      posts: Post & {
        // Custom computed properties
        readTime: number
        wordCount: number
      }
    }
  }
}

// Custom hook with typed return
export const usePostData = (id: string) => {
  const [post, setPost] = useState<GeneratedTypes['collections']['posts'] | null>(null)

  // Hook implementation...

  return post
}
```

### Type-Safe Payload Config

```typescript
import type { CollectionConfig, GlobalConfig } from 'payload'

// Type-safe field definitions
const createTextField = (name: string, options?: any) => ({
  name,
  type: 'text' as const,
  ...options
})

const createSelectField = <T extends string>(name: string, options: T[]) => ({
  name,
  type: 'select' as const,
  options: options.map(option => ({
    label: option,
    value: option
  }))
})

// Type-safe collection configuration
export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    createTextField('title', { required: true }),
    {
      name: 'content',
      type: 'richText'
    },
    createSelectField('status', ['draft', 'published']),
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users'
    }
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Type-safe hook logic
        if (data.title) {
          // TypeScript knows data.title is a string
          data.title = data.title.trim()
        }
        return data
      }
    ]
  }
}
```

### Generic Payload Utilities

```typescript
import type { Payload, GeneratedTypes } from 'payload/types'

// Generic repository pattern
export class PayloadRepository<T extends keyof GeneratedTypes['collections']> {
  constructor(
    private payload: Payload,
    private collection: T
  ) {}

  async find(
    params?: GeneratedTypes['collections'][T]['find'] & {
      where?: GeneratedTypes['collections'][T]['where']
    }
  ) {
    return this.payload.find({
      collection: this.collection,
      ...params
    })
  }

  async findByID(id: string, params?: Parameters<Payload['findByID']>[1]) {
    return this.payload.findByID({
      collection: this.collection,
      id,
      ...params
    })
  }

  async create(data: GeneratedTypes['collections'][T]['create']) {
    return this.payload.create({
      collection: this.collection,
      data
    })
  }

  async update(id: string, data: GeneratedTypes['collections'][T]['update']) {
    return this.payload.update({
      collection: this.collection,
      id,
      data
    })
  }

  async delete(id: string) {
    return this.payload.delete({
      collection: this.collection,
      id
    })
  }
}

// Usage
const postsRepo = new PayloadRepository('posts')

const posts = await postsRepo.find({
  where: {
    status: { equals: 'published' }
  }
})

const newPost = await postsRepo.create({
  title: 'New Post',
  content: 'Content here',
  status: 'draft'
})
```

## Working with Payload SDK

### Typed Payload SDK Usage

```typescript
import { PayloadSDK } from '@payloadcms/sdk'
import type { GeneratedTypes } from './payload-types'

// Initialize with type safety
const sdk = new PayloadSDK<GeneratedTypes>({
  baseURL: process.env.PAYLOAD_API_URL || 'http://localhost:3000/api',
  credentials: 'include'
})

// Type-safe API calls
const posts = await sdk.find({
  collection: 'posts',
  where: {
    status: { equals: 'published' }
  },
  depth: 1
})

const post = await sdk.findByID({
  collection: 'posts',
  id: '123',
  depth: 2
})

const newPost = await sdk.create({
  collection: 'posts',
  data: {
    title: 'New Post',
    content: 'Content here',
    status: 'draft'
  }
})
```

## API Route Typing

### Next.js API Routes

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import type { GeneratedTypes } from 'payload/types'
import getPayload from '../payload'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const payload = await getPayload()

  try {
    if (req.method === 'GET') {
      const posts = await payload.find({
        collection: 'posts',
        where: req.query as GeneratedTypes['collections']['posts']['where']
      })

      res.json(posts)
    } else if (req.method === 'POST') {
      const postData = req.body as GeneratedTypes['collections']['posts']['create']
      const post = await payload.create({
        collection: 'posts',
        data: postData
      })

      res.json(post)
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: error.message })
  }
}
```

## Testing with TypeScript

### Type-Safe Testing Utilities

```typescript
import type { Payload, GeneratedTypes } from 'payload/types'
import { buildPayloadTestConfig } from 'payload/dist/testing'

interface TestContext {
  payload: Payload
  testData: {
    posts: GeneratedTypes['collections']['posts'][]
    users: GeneratedTypes['collections']['users'][]
  }
}

export const createTestContext = async (): Promise<TestContext> => {
  const config = buildPayloadTestConfig({
    // Your test config
  })

  const payload = await getPayload({ config })

  // Create test data
  const testUser = await payload.create({
    collection: 'users',
    data: {
      email: 'test@example.com',
      password: 'password123'
    }
  })

  const testPost = await payload.create({
    collection: 'posts',
    data: {
      title: 'Test Post',
      content: 'Test content',
      status: 'published'
    }
  })

  return {
    payload,
    testData: {
      posts: [testPost],
      users: [testUser]
    }
  }
}

// Example test
export const testPostCRUD = async () => {
  const { payload } = await createTestContext()

  // Create
  const post = await payload.create({
    collection: 'posts',
    data: {
      title: 'New Post',
      content: 'Content'
    }
  })

  // TypeScript knows post has the correct type
  expect(post.title).toBe('New Post')

  // Update
  const updatedPost = await payload.update({
    collection: 'posts',
    id: post.id,
    data: {
      title: 'Updated Post'
    }
  })

  expect(updatedPost.title).toBe('Updated Post')

  // Delete
  await payload.delete({
    collection: 'posts',
    id: post.id
  })
}
```

## Configuration for TypeScript

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@payload-types/*": ["./src/types/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".payload/types.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "type-check": "tsc --noEmit",
    "generate-types": "payload generate:types",
    "dev:payload": "concurrently \"npm run generate-types\" \"npm run dev\""
  },
  "dependencies": {
    "payload": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "concurrently": "^8.0.0"
  }
}
```

## Best Practices

### 1. Type Safety First

```typescript
// Good: Use generated types
const posts = await payload.find({
  collection: 'posts',
  where: {
    status: { equals: 'published' } // TypeScript validates this
  }
})

// Bad: Use any types
const posts: any = await payload.find({
  collection: 'posts'
})
```

### 2. Custom Type Guards

```typescript
// Type guard for checking document types
export const isPost = (doc: any): doc is GeneratedTypes['collections']['posts'] => {
  return doc?.collection === 'posts'
}

// Usage
const handleDocument = (doc: unknown) => {
  if (isPost(doc)) {
    // TypeScript knows doc is a Post
    console.log(doc.title)
  }
}
```

### 3. Error Handling with Types

```typescript
import type { APIError } from 'payload/types'

interface PayloadResponse<T> {
  data?: T
  error?: APIError
}

const safePayloadCall = async <T>(
  operation: () => Promise<T>
): Promise<PayloadResponse<T>> => {
  try {
    const data = await operation()
    return { data }
  } catch (error) {
    return { error: error as APIError }
  }
}
```

### 4. Generic Components

```typescript
// Generic list component for any collection
interface PayloadListProps<T extends keyof GeneratedTypes['collections']> {
  collection: T
  data: GeneratedTypes['collections'][T][]
  renderItem: (item: GeneratedTypes['collections'][T]) => React.ReactNode
}

function PayloadList<T extends keyof GeneratedTypes['collections']>({
  collection,
  data,
  renderItem
}: PayloadListProps<T>) {
  return (
    <div>
      {data.map(item => (
        <React.Fragment key={item.id}>
          {renderItem(item)}
        </React.Fragment>
      ))}
    </div>
  )
}

// Usage
<PostList
  collection="posts"
  data={posts}
  renderItem={post => <PostCard post={post} />}
/>
```

TypeScript support in Payload provides excellent developer experience with full type safety, enabling you to catch errors at compile time and build more reliable applications with better tooling and refactoring capabilities.