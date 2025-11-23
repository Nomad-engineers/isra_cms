# Local API

**Tip:**

Here are some common examples of how you can use the Local API:

- Fetching Payload data within React Server Components
- Seeding data via Node seed scripts that you write and maintain
- Opening custom Next.js route handlers which feature additional functionality but still rely on Payload
- Within Access Control and Hooks

## Accessing Payload

You can gain access to the currently running payload object via two ways:

### Accessing from args or req

The Local API is accessible through the `payload` property that's available in hooks, access control functions, and more:

```typescript
import { CollectionConfig } from 'payload/types'

const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    afterChange: [
      ({ req, doc }) => {
        // Access payload from req
        const payload = req.payload

        // Use payload to perform other operations
        const relatedDocs = await payload.find({
          collection: 'categories',
          where: {
            posts: {
              contains: doc.id,
            },
          },
        })

        return doc
      },
    ],
  },
}
```

### Importing it

You can also import and initialize payload directly:

```typescript
import { getPayload } from 'payload'
import config from '@payload-config' // your payload config file

const payload = await getPayload({ config })

// Now you can use payload methods
const posts = await payload.find({
  collection: 'posts',
})
```

## Local options available

You can specify more options within the Local API vs. REST or GraphQL due to the server-only context that they are executed in.

| Local Option | Description |
|--------------|-------------|
| **collection** | Required for Collection operations. Specifies the Collection slug to operate against. |
| **data** | The data to use within the operation. Required for `create`, `update`. |
| **depth** | Control auto-population of nested relationship and upload fields. |
| **locale** | Specify locale for any returned documents. |
| **select** | Specify select to control which fields to include to the result. |
| **populate** | Specify populate to control which fields to include to the result from populated documents. |
| **fallbackLocale** | Specify a fallback locale to use for any returned documents. This can be a single locale or array of locales. |
| **overrideAccess** | Skip access control. By default, this property is set to `true` within all Local API operations. |
| **overrideLock** | By default, document locks are ignored (`true`). Set to `false` to enforce locks and prevent operations when a document is locked by another user. More details. |
| **user** | If you set `overrideAccess` to `false`, you can pass a user to use against the access control checks. |
| **showHiddenFields** | Opt-in to receiving hidden fields. By default, they are hidden from returned documents in accordance to your config. |
| **pagination** | Set to `false` to return all documents and avoid querying for document counts. |
| **context** | Context, which will then be passed to `context` and `req.context`, which can be read by hooks. Useful if you want to pass additional information to the hooks which shouldn't be necessarily part of the document, for example a `triggerBeforeChange` option which can be read by the BeforeChange hook to determine if it should run or not. |
| **disableErrors** | When set to `true`, errors will not be thrown. Instead, the `findByID` operation will return `null`, and the `find` operation will return an empty documents array. |
| **disableTransaction** | When set to `true`, database transactions will not be initialized. |

There are more options available on an operation by operation basis outlined below.

## Transactions

When your database uses transactions you need to thread `req` through to all local operations. Postgres uses transactions and MongoDB uses transactions when you are using replica sets. Passing `req` without transactions is still recommended.

**Note:**

By default, all access control checks are disabled in the Local API, but you can re-enable them if you'd like, as well as pass a specific user to run the operation with.

## Collections

The following Collection operations are available through the Local API:

### Create

```typescript
const createdPost = await payload.create({
  collection: 'posts',
  data: {
    title: 'My new post',
    content: 'This is the content',
  },
  user: req.user, // optional user for access control
})
```

**Additional options:**
- `depth`: number - How deep to populate relationships
- `locale`: string - Localize the operation
- `fallbackLocale`: string | string[] - Fallback locale(s)

### Find

```typescript
const posts = await payload.find({
  collection: 'posts',
  where: {
    status: {
      equals: 'published',
    },
  },
  limit: 10,
  page: 1,
  sort: '-createdAt',
})
```

**Additional options:**
- `depth`: number - How deep to populate relationships
- `locale`: string - Localize the operation
- `fallbackLocale`: string | string[] - Fallback locale(s)
- `pagination`: boolean - Enable/disable pagination (default: true)
- `select`: object - Field selection
- `populate`: object - Field population

`pagination`, `page`, and `limit` are three related properties documented [here](https://payloadcms.com/docs/local-api/pagination).

### Find by ID

```typescript
const post = await payload.findByID({
  collection: 'posts',
  id: '6031ac9e1289176380734024',
  depth: 2, // populate relationships up to 2 levels deep
})
```

**Additional options:**
- `depth`: number - How deep to populate relationships
- `locale`: string - Localize the operation
- `fallbackLocale`: string | string[] - Fallback locale(s)
- `select`: object - Field selection
- `populate`: object - Field population

### Count

```typescript
const totalPosts = await payload.count({
  collection: 'posts',
  where: {
    status: {
      equals: 'published',
    },
  },
})
```

### FindDistinct

```typescript
const distinctValues = await payload.findDistinct({
  collection: 'posts',
  distinct: 'status',
  where: {
    createdAt: {
      greater_than: '2023-01-01',
    },
  },
})
```

### Update by ID

```typescript
const updatedPost = await payload.update({
  collection: 'posts',
  id: '6031ac9e1289176380734024',
  data: {
    title: 'Updated title',
    content: 'Updated content',
  },
  user: req.user, // optional user for access control
})
```

**Additional options:**
- `depth`: number - How deep to populate relationships
- `locale`: string - Localize the operation
- `fallbackLocale`: string | string[] - Fallback locale(s)

### Update Many

```typescript
const result = await payload.update({
  collection: 'posts',
  where: {
    status: {
      equals: 'draft',
    },
  },
  data: {
    status: 'published',
  },
  user: req.user, // optional user for access control
})
```

### Delete

```typescript
const deletedPost = await payload.delete({
  collection: 'posts',
  id: '6031ac9e1289176380734024',
  user: req.user, // optional user for access control
})
```

### Delete Many

```typescript
const result = await payload.delete({
  collection: 'posts',
  where: {
    status: {
      equals: 'archived',
    },
  },
  user: req.user, // optional user for access control
})
```

## Auth Operations

If a collection has Authentication enabled, additional Local API operations will be available:

### Auth

```typescript
const result = await payload.auth({
  collection: 'users',
  data: {
    email: 'user@example.com',
    password: 'password123',
  },
  req,
})
```

### Login

```typescript
const { token, user } = await payload.login({
  collection: 'users',
  data: {
    email: 'user@example.com',
    password: 'password123',
  },
  req,
})
```

### Forgot Password

```typescript
const result = await payload.forgotPassword({
  collection: 'users',
  data: {
    email: 'user@example.com',
  },
  req,
})
```

### Reset Password

```typescript
const result = await payload.resetPassword({
  collection: 'users',
  data: {
    token: 'reset-token-here',
    password: 'new-password',
  },
  req,
})
```

### Unlock

```typescript
const result = await payload.unlock({
  collection: 'users',
  data: {
    email: 'user@example.com',
    token: 'unlock-token-here',
  },
  req,
})
```

### Verify

```typescript
const result = await payload.verify({
  collection: 'users',
  token: 'verification-token-here',
  req,
})
```

## Globals

The following Global operations are available through the Local API:

### Find

```typescript
const globalData = await payload.findGlobal({
  slug: 'settings',
  locale: 'en', // optional
})
```

**Additional options:**
- `locale`: string - Localize the operation
- `fallbackLocale`: string | string[] - Fallback locale(s)
- `select`: object - Field selection
- `populate`: object - Field population

### Update

```typescript
const updatedGlobal = await payload.updateGlobal({
  slug: 'settings',
  data: {
    siteName: 'My Website',
    siteDescription: 'A great website',
  },
  user: req.user, // optional user for access control
})
```

## TypeScript

Local API calls will automatically infer your generated types.

Here is an example of usage:

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post } from '@/payload-types' // your generated types

export default async function Page() {
  const payload = await getPayload({ config })

  // TypeScript will infer the return type
  const posts = await payload.find({
    collection: 'posts',
  })

  // You can also specify types explicitly
  const postsTyped = await payload.find({
    collection: 'posts',
  }) as {
    docs: Post[]
    totalDocs: number
    limit: number
    totalPages: number
    page: number
    pagingCounter: number
    hasPrevPage: boolean
    hasNextPage: boolean
    prevPage: number | null
    nextPage: number | null
  }

  return (
    <div>
      {posts.docs.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  )
}
```

### Using Payload outside Next.js

You can use the Local API outside of Next.js as well, for example in Node.js scripts:

```typescript
// seed.js
import { getPayload } from 'payload'
import config from './payload.config.js'

async function seed() {
  const payload = await getPayload({ config })

  // Create sample data
  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
    },
  })

  await payload.create({
    collection: 'posts',
    data: {
      title: 'First Post',
      content: 'This is the first post',
      status: 'published',
    },
  })

  console.log('Seed data created successfully')
  process.exit(0)
}

seed().catch(console.error)
```

Run the script:

```bash
node seed.js
```

## Common Patterns

### Server Components

```typescript
// app/posts/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function PostsPage() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    depth: 2,
  })

  return (
    <div>
      <h1>Posts</h1>
      {posts.docs.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}
```

### Custom API Routes

```typescript
// app/api/custom/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  // Custom logic here
  const featuredPosts = await payload.find({
    collection: 'posts',
    where: {
      featured: { equals: true },
      status: { equals: 'published' },
    },
    limit: 3,
    sort: '-createdAt',
  })

  return NextResponse.json(featuredPosts)
}
```

### Hooks with Local API

```typescript
{
  slug: 'posts',
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const payload = req.payload

        // Auto-generate excerpt if not provided
        if (!doc.excerpt && doc.content) {
          const excerpt = doc.content.substring(0, 150) + '...'

          await payload.update({
            collection: 'posts',
            id: doc.id,
            data: { excerpt },
          })
        }

        return doc
      },
    ],
  },
}
```

#### Related Guides

- [Exploring Payload Local API: Faster queries for Next.js & beyond](https://payloadcms.com/blog/exploring-payload-local-api-faster-queries-for-next-js-and-beyond)