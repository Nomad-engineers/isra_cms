# Querying your Documents

In Payload, "querying" means filtering or searching through Documents within a [Collection](../../basics/getting-started/concepts.md). The querying language in Payload is designed to be simple and powerful, allowing you to filter Documents with extreme precision through an intuitive and standardized structure.

Payload provides three common APIs for querying your data:

- **[Local API](../local-api/overview.md)** - Extremely fast, direct-to-database access
- **[REST API](../rest-api/overview.md)** - Standard HTTP endpoints for querying and mutating data
- **[GraphQL](../graphql/overview.md)** - A full GraphQL API with a GraphQL Playground

Each of these APIs share the same underlying querying language, and fully support all of the same features. This means that you can learn Payload's querying language once, and use it across any of the APIs that you might use.

To query your Documents, you can send any number of [Operators](#operators) through your request:

```typescript
import type { Where } from 'payload'

const query: Where = {
  color: {
    equals: 'blue',
  },
}
```

The exact query syntax will depend on the API you are using, but the concepts are the same across all APIs. [More details](#writing-queries).

> **Tip:** You can also use queries within [Access Control](../../basics/access-control/overview.md) functions.

## Operators

The following operators are available for use in queries:

| Operator | Description |
|----------|-------------|
| `equals` | The value must be exactly equal. |
| `not_equals` | The query will return all documents where the value is not equal. |
| `greater_than` | For numeric or date-based fields. |
| `greater_than_equal` | For numeric or date-based fields. |
| `less_than` | For numeric or date-based fields. |
| `less_than_equal` | For numeric or date-based fields. |
| `like` | Case-insensitive string must be present. If string of words, all words must be present, in any order. |
| `contains` | Must contain the value entered, case-insensitive. |
| `in` | The value must be found within the provided comma-delimited list of values. |
| `not_in` | The value must NOT be within the provided comma-delimited list of values. |
| `all` | The value must contain all values provided in the comma-delimited list. Note: currently this operator is supported only with the MongoDB adapter. |
| `exists` | Only return documents where the value either exists (`true`) or does not exist (`false`). |
| `near` | For distance related to a [Point Field](../../basics/fields/point.md) comma separated as `<longitude>, <latitude>, <maxDistance in meters (nullable)>, <minDistance in meters (nullable)>`. |
| `within` | For [Point Fields](../../basics/fields/point.md) to filter documents based on whether points are inside of the given area defined in GeoJSON. [Example](../../basics/fields/point.md#querying-within) |
| `intersects` | For [Point Fields](../../basics/fields/point.md) to filter documents based on whether points intersect with the given area defined in GeoJSON. [Example](../../basics/fields/point.md#querying-intersects) |

> **Tip:** If you know your users will be querying on certain fields a lot, add `index: true` to the Field Config. This will speed up searches using that field immensely. [More details](../../basics/database/overview.md#indexes).

### And / Or Logic

In addition to defining simple queries, you can join multiple queries together using AND / OR logic. These can be nested as deeply as you need to create complex queries.

To join queries, use the `and` or `or` keys in your query object:

```typescript
import type { Where } from 'payload'

const query: Where = {
  or: [
    {
      color: {
        equals: 'mint',
      },
    },
    {
      and: [
        {
          color: {
            equals: 'white',
          },
        },
        {
          featured: {
            equals: false,
          },
        },
      ],
    },
  ],
}
```

Written in plain English, if the above query were passed to a `find` operation, it would translate to finding posts where either the `color` is `mint` OR the `color` is `white` AND `featured` is set to false.

### Nested Properties

When working with nested properties, which can happen when using relational fields, it is possible to use the dot notation to access the nested property. For example, when working with a `Song` collection that has an `artists` field which is related to an `Artists` collection using the `name: 'artists'`. You can access a property within the collection `Artists` like so:

```typescript
import type { Where } from 'payload'

const query: Where = {
  'artists.featured': {
    exists: true, // operator to use and boolean value that needs to be true
  },
}
```

## Writing Queries

Writing queries in Payload is simple and consistent across all APIs, with only minor differences in syntax between them.

### Local API

The [Local API](../local-api/overview.md) supports the `find` operation that accepts a raw query object:

```typescript
import type { Payload } from 'payload'

const getPosts = async (payload: Payload) => {
  const posts = await payload.find({
    collection: 'posts',
    where: {
      color: {
        equals: 'mint',
      },
    },
  })

  return posts
}
```

### GraphQL API

All `find` queries in the [GraphQL API](../graphql/overview.md) support the `where` argument that accepts a raw query object:

```graphql
query {
  Posts(where: { color: { equals: mint } }) {
    docs {
      color
    }
    totalDocs
  }
}
```

### REST API

With the [REST API](../rest-api/overview.md), you can use the full power of Payload queries, but they are written as query strings instead:

```
https://localhost:3000/api/posts?where[color][equals]=mint
```

To understand the syntax, you need to understand that complex URL search strings are parsed into a JSON object. This one isn't too bad, but more complex queries get unavoidably more difficult to write.

For this reason, we recommend to use the extremely helpful and ubiquitous [qs-esm](https://www.npmjs.com/package/qs-esm) package to parse your JSON / object-formatted queries into query strings:

```typescript
import { stringify } from 'qs-esm'
import type { Where } from 'payload'

const query: Where = {
  color: {
    equals: 'mint',
  },
  // This query could be much more complex
  // and qs-esm would handle it beautifully
}

const getPosts = async () => {
  const stringifiedQuery = stringify(
    {
      where: query, // ensure that `qs-esm` adds the `where` property, too!
    },
    {
      addQueryPrefix: true,
    },
  )

  const response = await fetch(`http://localhost:3000/api/posts${stringifiedQuery}`)
  // Continue to handle the response below...
}
```

## Performance

There are several ways to optimize your queries. Many of these options directly impact overall database overhead, response sizes, and/or computational load and can significantly improve performance.

When building queries, combine as many of these strategies together as possible to ensure your queries are as performant as they can be.

For more performance tips, see the [Performance documentation](../../deployment/performance.md).

### Indexes

Build [Indexes](../../basics/database/overview.md#indexes) for fields that are often queried or sorted by.

When your query runs, the database will not search the entire document to find that one field, but will instead use the index to quickly locate the data.

This is done by adding `index: true` to the Field Config for that field:

```typescript
// In your collection configuration
{
  name: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      index: true, // Add an index to the title field
    },
    // Other fields...
  ],
}
```

To learn more, see the [Indexes documentation](../../basics/database/overview.md#indexes).

### Depth

Set the [Depth](./depth.md) to only the level that you need to avoid populating unnecessary related documents.

Relationships will only populate down to the specified depth, and any relationships beyond that depth will only return the ID of the related document.

```typescript
const posts = await payload.find({
  collection: 'posts',
  where: {
    // ...
  },
  depth: 0, // Only return the IDs of related documents
})
```

To learn more, see the [Depth documentation](./depth.md).

### Limit

Set the [Limit](./pagination.md#limit) if you can reliably predict the number of matched documents, such as when querying on a unique field.

```typescript
const posts = await payload.find({
  collection: 'posts',
  where: {
    slug: {
      equals: 'unique-post-slug',
    },
  },
  limit: 1, // Only expect one document to be returned
})
```

> **Tip:** Use in combination with `pagination: false` for best performance when querying by unique fields.

To learn more, see the [Limit documentation](./pagination.md#limit).

### Select

Use the [Select API](./select.md) to only process and return the fields you need.

This will reduce the amount of data returned from the request, and also skip processing of any fields that are not selected, such as running their field hooks.

```typescript
const posts = await payload.find({
  collection: 'posts',
  where: {
    // ...
  },
  select: {
    title: true,
  },
})
```

This is a basic example, but there are many ways to use the Select API, including selecting specific fields, excluding fields, etc.

To learn more, see the [Select documentation](./select.md).

### Pagination

[Disable Pagination](./pagination.md#disabling-pagination) if you can reliably predict the number of matched documents, such as when querying on a unique field.

```typescript
const posts = await payload.find({
  collection: 'posts',
  where: {
    slug: {
      equals: 'unique-post-slug',
    },
  },
  pagination: false, // Return all matched documents without pagination
})
```

> **Tip:** Use in combination with `limit: 1` for best performance when querying by unique fields.

To learn more, see the [Pagination documentation](./pagination.md).

## Query Examples

### Basic Queries

#### Simple Equality
```typescript
// Find posts where status equals 'published'
const query = {
  status: {
    equals: 'published'
  }
}
```

#### Multiple Fields
```typescript
// Find published posts after a specific date
const query = {
  and: [
    {
      status: {
        equals: 'published'
      }
    },
    {
      publishedAt: {
        greater_than: '2024-01-01'
      }
    }
  ]
}
```

### String Queries

#### Contains Search
```typescript
// Find posts where title contains 'payload'
const query = {
  title: {
    contains: 'payload'
  }
}
```

#### Like Search (case-insensitive, all words must match)
```typescript
// Find posts where content includes both 'react' and 'nextjs'
const query = {
  content: {
    like: 'react nextjs'
  }
}
```

### Number and Date Queries

#### Range Queries
```typescript
// Find posts with view count between 100 and 1000
const query = {
  viewCount: {
    and: [
      { greater_than_equal: 100 },
      { less_than_equal: 1000 }
    ]
  }
}
```

#### Date Range
```typescript
// Find posts published in the last 30 days
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

const query = {
  publishedAt: {
    greater_than: thirtyDaysAgo.toISOString()
  }
}
```

### Array and Relationship Queries

#### Array Contains
```typescript
// Find posts with specific tags
const query = {
  tags: {
    contains: 'javascript'
  }
}
```

#### In Array (multiple values)
```typescript
// Find posts with any of these categories
const query = {
  category: {
    in: ['tech', 'javascript', 'web-development']
  }
}
```

#### Relationship Exists
```typescript
// Find posts that have an author relationship populated
const query = {
  'author.name': {
    exists: true
  }
}
```

### Advanced Examples

#### Complex OR/AND Logic
```typescript
// Find posts that are either:
// - Featured and published
// - Or have a specific tag and high view count
const query = {
  or: [
    {
      and: [
        { featured: { equals: true } },
        { status: { equals: 'published' } }
      ]
    },
    {
      and: [
        { tags: { contains: 'popular' } },
        { viewCount: { greater_than: 500 } }
      ]
    }
  ]
}
```

#### Nested Property Queries
```typescript
// Find posts where the author's role is 'editor'
const query = {
  'author.role': {
    equals: 'editor'
  }
}

// Find posts where any category is active
const query = {
  'categories.active': {
    equals: true
  }
}
```

#### Negation
```typescript
// Find posts that don't have the 'draft' status and aren't featured
const query = {
  and: [
    {
      status: {
        not_equals: 'draft'
      }
    },
    {
      featured: {
        not_equals: true
      }
    }
  ]
}
```

## Querying by Field Type

### Text Fields
```typescript
// Exact match
{ title: { equals: 'My Post Title' } }

// Contains
{ title: { contains: 'Payload' } }

// Case-insensitive like
{ content: { like: 'react javascript' } }
```

### Number Fields
```typescript
// Greater than
{ price: { greater_than: 100 } }

// Between range
{ rating: { and: [
  { greater_than_equal: 3 },
  { less_than_equal: 5 }
]}}
```

### Date Fields
```typescript
// After specific date
{ createdAt: { greater_than: '2024-01-01T00:00:00.000Z' } }

// Before specific date
{ expiresAt: { less_than: new Date().toISOString() } }
```

### Boolean Fields
```typescript
// True
{ published: { equals: true } }

// False
{ archived: { equals: false } }

// Exists
{ featured: { exists: true } }
```

### Select/Radio Fields
```typescript
// Single option
{ status: { equals: 'published' } }

// Multiple options
{ category: { in: ['tech', 'design'] } }
```

### Relationship Fields
```typescript
// Relationship exists
{ author: { exists: true } }

// Specific relationship by ID
{ author: { equals: '64f1234567890abcdef12345' } }

// Nested property in relationship
{ 'author.role': { equals: 'editor' } }
```

### Array Fields
```typescript
// Array contains value
{ tags: { contains: 'javascript' } }

// Array contains any of these values
{ tags: { in: ['react', 'vue', 'angular'] } }

// Array contains all values (MongoDB only)
{ requiredSkills: { all: ['javascript', 'react'] } }
```

## Best Practices

### 1. Use Appropriate Operators

Choose the most efficient operator for your use case:

```typescript
// Good: Use equals for exact matches
{ status: { equals: 'published' } }

// Good: Use contains for partial text matches
{ title: { contains: 'react' } }

// Avoid: Using contains when equals would work
{ id: { contains: '123' } } // Use equals instead
```

### 2. Index Frequently Queried Fields

```typescript
{
  name: 'email',
  type: 'email',
  index: true, // Add index for frequently queried field
  unique: true, // Add unique constraint if applicable
}
```

### 3. Limit Result Size

```typescript
// Good: Use limit when you expect few results
const posts = await payload.find({
  collection: 'posts',
  where: { slug: { equals: 'unique-slug' } },
  limit: 1,
  pagination: false
})

// Good: Use pagination for large result sets
const posts = await payload.find({
  collection: 'posts',
  where: { status: { equals: 'published' } },
  limit: 20,
  page: 1
})
```

### 4. Select Only Needed Fields

```typescript
// Good: Select only required fields
const posts = await payload.find({
  collection: 'posts',
  select: {
    title: true,
    slug: true,
    publishedAt: true
  }
})
```

### 5. Use Proper Depth

```typescript
// Good: Minimal depth for better performance
const posts = await payload.find({
  collection: 'posts',
  depth: 0 // Only return IDs for relationships
})

// Good: Specify exact depth needed
const posts = await payload.find({
  collection: 'posts',
  depth: 1 // Populate one level of relationships
})
```

### 6. Combine Related Conditions

```typescript
// Good: Combine related conditions with AND
{
  and: [
    { status: { equals: 'published' } },
    { publishedAt: { less_than: new Date().toISOString() } }
  ]
}

// Good: Use OR for alternatives
{
  or: [
    { featured: { equals: true } },
    { viewCount: { greater_than: 1000 } }
  ]
}
```

This comprehensive query documentation provides everything you need to effectively filter, search, and retrieve your Payload documents with maximum efficiency and precision.