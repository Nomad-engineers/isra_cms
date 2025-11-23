# GraphQL Overview

In addition to its REST and Local APIs, Payload ships with a fully featured and extensible GraphQL API.

By default, the GraphQL API is exposed via `/api/graphql`, but you can customize this URL via specifying your `routes` within the main Payload Config.

The labels you provide for your Collections and Globals are used to name the GraphQL types that are created to correspond to your config. Special characters and spaces are removed.

## GraphQL Options

At the top of your Payload Config you can define all the options to manage GraphQL.

| Option | Description |
|--------|-------------|
| `mutations` | Any custom Mutations to be added in addition to what Payload provides. [More](./extending.md) |
| `queries` | Any custom Queries to be added in addition to what Payload provides. [More](./extending.md) |
| `maxComplexity` | A number used to set the maximum allowed complexity allowed by requests [More](#query-complexity-limits) |
| `disablePlaygroundInProduction` | A boolean that if false will enable the GraphQL playground in production environments, defaults to true. [More](#graphql-playground) |
| `disableIntrospectionInProduction` | A boolean that if false will enable the GraphQL introspection in production environments, defaults to true. |
| `disable` | A boolean that if true will disable the GraphQL entirely, defaults to false. |
| `validationRules` | A function that takes the ExecutionArgs and returns an array of ValidationRules. |

### Configuration Example

```typescript
import { buildConfig } from 'payload/config'

export default buildConfig({
  // ... other config
  graphQL: {
    maxComplexity: 1000,
    disablePlaygroundInProduction: false,
    disableIntrospectionInProduction: true,
    mutations: {
      // Custom mutations
    },
    queries: {
      // Custom queries
    },
    validationRules: (args) => [
      // Custom validation rules
    ],
  },
})
```

## Collections

Everything that can be done to a Collection via the REST or Local API can be done with GraphQL (outside of uploading files, which is REST-only). If you have a collection as follows:

```typescript
import type { CollectionConfig } from 'payload'

export const PublicUser: CollectionConfig = {
  slug: 'public-users',
  auth: true, // Auth is enabled
  fields: [
    // ...
  ],
}
```

Payload will automatically open up the following queries:

| Query Name | Operation |
|------------|-----------|
| `PublicUser` | findByID |
| `PublicUsers` | find |
| `countPublicUsers` | count |
| `mePublicUser` | me (auth operation) |

And the following mutations:

| Query Name | Operation |
|------------|-----------|
| `createPublicUser` | create |
| `updatePublicUser` | update |
| `deletePublicUser` | delete |
| `forgotPasswordPublicUser` | forgotPassword (auth operation) |
| `resetPasswordPublicUser` | resetPassword (auth operation) |
| `unlockPublicUser` | unlock (auth operation) |
| `verifyPublicUser` | verify (auth operation) |
| `loginPublicUser` | login (auth operation) |
| `logoutPublicUser` | logout (auth operation) |
| `refreshTokenPublicUser` | refresh (auth operation) |

### Collection Query Examples

```graphql
# Find a single user by ID
query GetUser($id: ID!) {
  PublicUser(id: $id) {
    id
    email
    name
    createdAt
  }
}

# Find multiple users with pagination and filtering
query GetUsers($limit: Int, $page: Int, $where: PublicUsersWhereInput) {
  PublicUsers(limit: $limit, page: $page, where: $where) {
    docs {
      id
      email
      name
    }
    hasNextPage
    hasPrevPage
    totalDocs
    totalPages
  }
}

# Count users matching criteria
query CountUsers($where: PublicUsersWhereInput) {
  countPublicUsers(where: $where)
}

# Get current authenticated user
query Me {
  mePublicUser {
    id
    email
    name
  }
}
```

### Collection Mutation Examples

```graphql
# Create a new user
mutation CreateUser($data: PublicUsersInsertInput!) {
  createPublicUser(data: $data) {
    id
    email
    name
  }
}

# Update a user
mutation UpdateUser($id: ID!, $data: PublicUsersUpdateInput!) {
  updatePublicUser(id: $id, data: $data) {
    id
    email
    name
  }
}

# Delete a user
mutation DeleteUser($id: ID!) {
  deletePublicUser(id: $id) {
    id
    email
    name
  }
}

# Login
mutation Login($email: String!, $password: String!) {
  loginPublicUser(email: $email, password: $password) {
    token
    user {
      id
      email
      name
    }
  }
}

# Logout
mutation Logout {
  logoutPublicUser
}

# Forgot password
mutation ForgotPassword($email: String!) {
  forgotPasswordPublicUser(email: $email)
}

# Reset password
mutation ResetPassword($token: String!, $password: String!) {
  resetPasswordPublicUser(token: $token, password: $password) {
    token
    user {
      id
      email
    }
  }
}
```

## Globals

Globals are also fully supported. For example:

```typescript
import type { GlobalConfig } from 'payload';

const Header: GlobalConfig = {
  slug: 'header',
  fields: [
    // ...
  ],
}
```

Payload will open the following query:

| Query Name | Operation |
|------------|-----------|
| `Header` | findOne |

And the following mutation:

| Query Name | Operation |
|------------|-----------|
| `updateHeader` | update |

### Global Query Examples

```graphql
# Get global data
query GetHeader {
  Header {
    id
    navigation {
      link
      label
    }
    logo {
      url
      alt
    }
  }
}
```

### Global Mutation Examples

```graphql
# Update global
mutation UpdateHeader($data: HeaderUpdateInput!) {
  updateHeader(data: $data) {
    id
    navigation {
      link
      label
    }
  }
}
```

## Preferences

User [preferences](../../admin/preferences.md) for the [Admin Panel](../../admin/overview.md) are also available to GraphQL the same way as other collection schemas are generated. To query preferences you must supply an authorization token in the header and only the preferences of that user will be accessible.

Payload will open the following query:

| Query Name | Operation |
|------------|-----------|
| `Preference` | findOne |

And the following mutations:

| Query Name | Operation |
|------------|-----------|
| `updatePreference` | update |
| `deletePreference` | delete |

### Preference Examples

```graphql
# Get user preference
query GetPreference($key: ID!) {
  Preference(key: $key) {
    key
    value
  }
}

# Update user preference
mutation UpdatePreference($key: ID!, $value: JSON!) {
  updatePreference(key: $key, value: $value) {
    key
    value
  }
}

# Delete user preference
mutation DeletePreference($key: ID!) {
  deletePreference(key: $key) {
    key
    value
  }
}
```

## GraphQL Playground

GraphQL Playground is enabled by default for development purposes, but disabled in production. You can enable it in production by passing `graphQL.disablePlaygroundInProduction` a `false` setting in the main Payload Config.

You can even log in using the `login[collection-singular-label-here]` mutation to use the Playground as an authenticated user.

> **Tip:** To see more regarding how the above queries and mutations are used, visit your GraphQL playground (by default at `${SERVER_URL}/api/graphql-playground`) while your server is running. There, you can use the "Schema" and "Docs" buttons on the right to see a ton of detail about how GraphQL operates within Payload.

### Accessing the Playground

```typescript
// Default URL in development
http://localhost:3000/api/graphql-playground

// With custom server URL
https://your-domain.com/api/graphql-playground
```

### Authentication in Playground

You can add authentication headers in the Playground's HTTP Headers section:

```json
{
  "Authorization": "JWT your-token-here"
}
```

## Custom Validation Rules

You can add custom validation rules to your GraphQL API by defining a `validationRules` function in your Payload Config. This function should return an array of [Validation Rules](https://graphql.org/graphql-js/validation/#validation-rules) that will be applied to all incoming queries and mutations.

```typescript
import { GraphQL } from '@payloadcms/graphql/types'
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  graphQL: {
    validationRules: (args) => [NoProductionIntrospection],
  },
  // ...
})

const NoProductionIntrospection: GraphQL.ValidationRule = (context) => ({
  Field(node) {
    if (process.env.NODE_ENV === 'production') {
      if (
        node.name.value === '__schema' ||
        node.name.value === '__type'
      ) {
        context.reportError(
          new GraphQL.GraphQLError(
            'GraphQL introspection is not allowed, but the query contained __schema or __type',
            { nodes: [node] },
          ),
        )
      }
    }
  },
})
```

### Common Validation Rule Examples

#### Disable Specific Fields in Production

```typescript
const DisableSensitiveFields: GraphQL.ValidationRule = (context) => ({
  Field(node) {
    if (process.env.NODE_ENV === 'production') {
      const sensitiveFields = ['password', 'secret', 'apiKey']
      if (sensitiveFields.includes(node.name.value)) {
        context.reportError(
          new GraphQL.GraphQLError(
            `Field "${node.name.value}" is not available in production`,
            { nodes: [node] },
          ),
        )
      }
    }
  },
})
```

#### Limit Query Depth

```typescript
const LimitQueryDepth = (maxDepth: number): GraphQL.ValidationRule => (context) => {
  const checkDepth = (node: any, depth: number = 0) => {
    if (depth > maxDepth) {
      context.reportError(
        new GraphQL.GraphQLError(
          `Query depth exceeds maximum allowed depth of ${maxDepth}`,
          { nodes: [node] },
        ),
      )
      return false
    }

    if (node.selectionSet) {
      return node.selectionSet.selections.every((selection: any) =>
        checkDepth(selection, depth + 1)
      )
    }

    return true
  }

  return {
    Document(node) {
      node.definitions.forEach((definition: any) => {
        if (definition.kind === 'OperationDefinition' && definition.selectionSet) {
          checkDepth(definition)
        }
      })
    },
  }
}
```

## Query Complexity Limits

Payload comes with a built-in query complexity limiter to prevent bad people from trying to slow down your server by running massive queries. To learn more, [click here](../../deployment/production.md#preventing-abuse).

### Setting Maximum Complexity

```typescript
export default buildConfig({
  graphQL: {
    maxComplexity: 1000, // Adjust based on your needs
  },
})
```

### Complexity Calculation

- Simple field selections: 1 point each
- Relationship fields: 5 points each (default)
- Nested queries multiply the complexity

## Field Complexity

You can define custom complexity for `relationship`, `upload` and `join` type fields. This is useful if you want to assign a higher complexity to a field that is more expensive to resolve. This can help prevent users from running queries that are too complex.

```typescript
const fieldWithComplexity = {
  name: 'authors',
  type: 'relationship',
  relationship: 'authors',
  graphQL: {
    complexity: 100,
  },
}
```

### Field Complexity Examples

```typescript
// High-complexity relationship (expensive join)
{
  name: 'relatedProducts',
  type: 'relationship',
  relationship: 'products',
  hasMany: true,
  graphQL: {
    complexity: 50, // Higher cost for expensive relationship
  },
}

// Low-complexity relationship (simple lookup)
{
  name: 'category',
  type: 'relationship',
  relationship: 'categories',
  graphQL: {
    complexity: 5, // Lower cost for simple relationship
  },
}

// Upload field with media processing
{
  name: 'gallery',
  type: 'array',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      graphQL: {
        complexity: 20, // Higher cost for uploads
      },
    },
  ],
}
```

## Advanced GraphQL Patterns

### Nested Queries with Relationships

```graphql
query GetPostWithRelations($id: ID!) {
  Post(id: $id) {
    id
    title
    content
    author {
      id
      name
      email
    }
    categories {
      docs {
        id
        name
        slug
      }
    }
    comments {
      docs {
        id
        content
        author {
          name
        }
      }
    }
  }
}
```

### Conditional Fields with Fragments

```graphql
query GetPostWithFragments($id: ID!, $includeAuthor: Boolean!) {
  Post(id: $id) {
    id
    title
    content
    ...authorFields @include(if: $includeAuthor)
  }
}

fragment authorFields on Post {
  author {
    id
    name
    email
    bio
  }
}
```

### Bulk Operations

```graphql
mutation BulkUpdatePosts($updates: [PostUpdateInput!]!) {
  # This would require a custom mutation
  bulkUpdatePosts(updates: $updates) {
    success
    updatedCount
  }
}
```

### Search and Filtering

```graphql
query SearchPosts($search: String, $category: String, $limit: Int) {
  Posts(
    where: {
      and: [
        { title: { contains: $search } }
        { category: { equals: $category } }
        { status: { equals: "published" } }
      ]
    }
    limit: $limit
    sort: "-createdAt"
  ) {
    docs {
      id
      title
      excerpt
      category {
        name
      }
    }
    totalDocs
  }
}
```

## Client Integration Examples

### React with Apollo Client

```typescript
import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client'

const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache(),
})

// Query hook
const GET_POSTS = gql`
  query GetPosts($limit: Int) {
    Posts(limit: $limit) {
      docs {
        id
        title
        content
      }
    }
  }
`

function PostsList() {
  const { loading, error, data } = useQuery(GET_POSTS, {
    variables: { limit: 10 },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div>
      {data.Posts.docs.map((post: any) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  )
}
```

### Fetch API

```typescript
async function graphqlQuery(query: string, variables: any = {}) {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${token}`, // if authenticated
    },
    body: JSON.stringify({ query, variables }),
  })

  const { data, errors } = await response.json()

  if (errors) {
    throw new Error(errors[0].message)
  }

  return data
}

// Usage
const posts = await graphqlQuery(`
  query GetPosts($limit: Int) {
    Posts(limit: $limit) {
      docs {
        id
        title
      }
    }
  }
`, { limit: 10 })
```

## Performance Tips

1. **Use specific field selection** to avoid over-fetching
2. **Implement query complexity limits** to prevent abuse
3. **Consider field complexity** for expensive operations
4. **Use pagination** for large datasets
5. **Cache frequently accessed data** on the client side
6. **Monitor query performance** and optimize slow queries

## Error Handling

GraphQL errors are returned in a structured format:

```json
{
  "errors": [
    {
      "message": "Cannot query field \"nonexistentField\" on type \"Post\".",
      "locations": [
        {
          "line": 3,
          "column": 5
        }
      ],
      "extensions": {
        "code": "GRAPHQL_VALIDATION_FAILED"
      }
    }
  ],
  "data": null
}
```

### Common Error Types

- **Syntax errors**: Invalid GraphQL syntax
- **Validation errors**: Field doesn't exist or type mismatch
- **Complexity errors**: Query exceeds maximum complexity
- **Authentication errors**: Missing or invalid token
- **Authorization errors**: User doesn't have permission

## Best Practices

1. **Use TypeScript** with generated types for type safety
2. **Implement proper authentication and authorization**
3. **Set reasonable complexity limits**
4. **Use fragments** for reusable field selections
5. **Implement proper error handling**
6. **Monitor and analyze query patterns**
7. **Use DataLoader** for N+1 query problems
8. **Consider query batching** for multiple operations

This comprehensive GraphQL documentation provides everything you need to work with Payload's GraphQL API, from basic queries to advanced patterns and optimizations.