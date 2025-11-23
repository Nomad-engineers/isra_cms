# Access Control

Access Control determines what a user can and cannot do with any given Document, as well as what they can and cannot see within the Admin Panel. By implementing Access Control, you can define granular restrictions based on the user, their roles (RBAC), Document data, or any other criteria your application requires.

Access Control functions are scoped to the operation, meaning you can have different rules for `create`, `read`, `update`, `delete`, etc. Access Control functions are executed before any changes are made and before any operations are completed. This allows you to determine if the user has the necessary permissions before fulfilling the request.

There are many use cases for Access Control, including:

- Allowing anyone read access to all posts
- Only allowing public access to posts where a `status` field is equal to `published`
- Giving only users with a `role` field equal to `admin` the ability to delete posts
- Allowing anyone to submit contact forms, but only logged in users to read, update or delete them
- Restricting a user to only be able to see their own orders, but no-one else's
- Allowing users that belong to a certain organization to access only that organization's resources

Types of Access Control:

- **Collection Access Control** - Control access to entire collections
- **Global Access Control** - Control access to globals
- **Field Access Control** - Control access to specific fields

## Default Access Control

**Important**: In the Local API, all Access Control is skipped by default. This allows your server to have full control over your application. To opt back in, you can set the `overrideAccess` option to `false` in your requests.

```typescript
const posts = await payload.find({
  collection: 'posts',
  overrideAccess: false, // Enable access control
  user: req.user, // Pass user for access control checks
})
```

## The Access Operation

If you use `id` or `data` within your access control functions, make sure to check that they are defined first. If they are not, then you can assume that your Access Control is being executed via the Access Operation to determine solely what the user can do within the Admin Panel.

```typescript
access: {
  read: ({ id, data }) => {
    // Check if we're in the Admin Panel (Access Operation)
    // or an actual document request
    if (!id && !data) {
      // This is an Access Operation - return what the user can do
      return {
        name: true,
        description: true,
      }
    }

    // This is a real document operation
    return data.publishedAt ? true : false
  },
}
```

## Locale Specific Access Control

To implement locale-specific access control, you can use the `req.locale` argument in your access control functions. This argument allows you to evaluate the current locale of the request and determine access permissions accordingly.

Here is an example:

```typescript
access: {
  read: ({ req }) => {
    // Only allow read access for US locale
    return req.locale === 'en-US'
  },
  update: ({ req }) => {
    // Only allow updates for users in their own locale
    return req.locale === req.user.locale
  },
}
```

## Collection Access Control

Collection access control is defined at the collection level and determines what operations users can perform on documents within that collection.

### Basic Collection Access Control

```typescript
import { CollectionConfig } from 'payload/types'

const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: () => true, // Anyone can read posts
    create: ({ req: { user } }) => !!user, // Only logged-in users can create
    update: ({ req: { user } }) => {
      // Only admins can update
      return user?.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete
      return user?.role === 'admin'
    },
  },
  // ... other collection config
}
```

### Advanced Collection Access Control

```typescript
const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: ({ req: { user } }) => {
      // Published posts are public
      // Unpublished posts only for admins
      if (!user) return false

      return user.role === 'admin' || {
        status: {
          equals: 'published',
        },
      }
    },
    create: ({ req: { user } }) => {
      // Only users with 'editor' or 'admin' roles can create
      return user?.role === 'admin' || user?.role === 'editor'
    },
    update: ({ id, data, req: { user } }) => {
      // Authors can update their own posts, admins can update any
      if (!user) return false

      return user.role === 'admin' || (
        data?.author === user.id ||
        id === 'new' // Allow creation in admin
      )
    },
    delete: ({ data, req: { user } }) => {
      // Only admins can delete published posts
      // Authors can delete their own unpublished posts
      if (!user) return false

      if (user.role === 'admin') return true

      return data?.status !== 'published' && data?.author === user.id
    },
  },
}
```

## Global Access Control

Globals have a slightly different access control structure since they represent single documents rather than collections:

```typescript
import { GlobalConfig } from 'payload/types'

const Settings: GlobalConfig = {
  slug: 'settings',
  access: {
    read: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
    update: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
}
```

## Field Access Control

Field access control allows you to control access to specific fields within a collection, providing even more granular control over what users can see and modify.

### Field-Level Access Control

```typescript
{
  name: 'internalNotes',
  type: 'textarea',
  access: {
    read: ({ req: { user } }) => {
      // Only admins can read internal notes
      return user?.role === 'admin'
    },
    update: ({ req: { user } }) => {
      // Only admins can update internal notes
      return user?.role === 'admin'
    },
  },
  admin: {
    // Hide field from non-admins entirely
    condition: ({ req: { user } }) => user?.role === 'admin',
  },
}
```

### Dynamic Field Access Control

```typescript
{
  name: 'sensitiveData',
  type: 'text',
  access: {
    read: ({ data, req: { user } }) => {
      // Users can only read their own sensitive data
      return user?.id === data?.owner
    },
    update: ({ data, req: { user } }) => {
      // Only data owners or admins can update
      return user?.id === data?.owner || user?.role === 'admin'
    },
  },
}
```

## Role-Based Access Control (RBAC)

### Example: User with Roles Collection

```typescript
const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'User', value: 'user' },
      ],
      required: true,
      defaultValue: 'user',
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
    },
  ],
}
```

### Example: Post Collection with RBAC

```typescript
const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: ({ data, req: { user } }) => {
      if (!user) {
        // Public access to published posts
        return data?.status === 'published'
      }

      if (user.role === 'admin') {
        return true // Admins can read everything
      }

      if (user.role === 'editor') {
        // Editors can read all posts
        return true
      }

      // Users can only read their own published posts
      return data?.author === user.id && data?.status === 'published'
    },
    create: ({ req: { user } }) => {
      // Only editors and admins can create posts
      return user?.role === 'admin' || user?.role === 'editor'
    },
    update: ({ data, req: { user } }) => {
      if (user?.role === 'admin') return true

      if (user?.role === 'editor') return true

      // Users can only update their own posts
      return data?.author === user.id
    },
    delete: ({ data, req: { user } }) => {
      // Only admins can delete posts
      return user?.role === 'admin'
    },
  },
}
```

## Organization-Based Access Control

### Example: Multi-Tenant Application

```typescript
const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      access: {
        // Hide organization field from users
        read: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
  access: {
    read: ({ data, req: { user } }) => {
      if (user?.role === 'admin') return true

      // Users can only access posts from their organization
      return data?.organization === user?.organization
    },
    create: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      // Users can create posts, they'll be auto-assigned to their org
      return user?.organization
    },
    update: ({ data, req: { user } }) => {
      if (user?.role === 'admin') return true

      return data?.organization === user?.organization
    },
    delete: ({ data, req: { user } }) => {
      if (user?.role === 'admin') return true

      return data?.organization === user?.organization
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req: { user } }) => {
        // Auto-assign organization for non-admins
        if (user?.role !== 'admin' && user?.organization && !data.organization) {
          return {
            ...data,
            organization: user.organization,
          }
        }
        return data
      },
    ],
  },
}
```

## Access Control Patterns

### 1. Public/Private Content

```typescript
{
  slug: 'articles',
  access: {
    read: ({ data }) => {
      // Public access to published articles
      return data?.status === 'published'
    },
    // Only admins can create/update/delete
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
}
```

### 2. Ownership-Based Access

```typescript
{
  slug: 'documents',
  access: {
    read: ({ data, req: { user } }) => {
      // Owners and admins can read
      return data?.owner === user?.id || user?.role === 'admin'
    },
    update: ({ data, req: { user } }) => {
      // Only owners can update their documents
      return data?.owner === user?.id
    },
    delete: ({ data, req: { user } }) => {
      // Only owners can delete, admins can override
      return data?.owner === user?.id || user?.role === 'admin'
    },
  },
}
```

### 3. Time-Based Access

```typescript
{
  slug: 'events',
  access: {
    read: ({ data }) => {
      // Events can be read if they haven't expired
      return !data?.expiresAt || new Date(data.expiresAt) > new Date()
    },
    update: ({ data, req: { user } }) => {
      // Users can update future events, admins can update any
      if (user?.role === 'admin') return true

      return !data?.startsAt || new Date(data.startsAt) > new Date()
    },
  },
}
```

## Best Practices

1. **Default to Deny**: Always deny access by default and explicitly grant permissions
2. **Use Type Safety**: Leverage TypeScript for access control function signatures
3. **Separate Concerns**: Use different access control strategies for different use cases
4. **Test Thoroughly**: Test access control with different user roles and scenarios
5. **Document Permissions**: Clearly document what each role can do
6. **Use Helper Functions**: Create reusable access control helpers for common patterns

### Helper Function Example

```typescript
// access-helpers.ts
export const isAdmin = ({ req: { user } }) => {
  return user?.role === 'admin'
}

export const isOwnerOrAdmin = ({ data, req: { user } }) => {
  return data?.owner === user?.id || user?.role === 'admin'
}

export const canAccessOrganization = ({ data, req: { user } }) => {
  return data?.organization === user?.organization || user?.role === 'admin'
}

export const isPublished = ({ data }) => {
  return data?.status === 'published'
}
```

```typescript
// Using helpers in collection config
{
  access: {
    read: ({ data, req }) => isAdmin({ req }) || (isPublished({ data }) && canAccessOrganization({ data, req })),
    update: isOwnerOrAdmin,
    delete: isAdmin,
  },
}
```

## Testing Access Control

Always test your access control functions with different user roles and scenarios:

```typescript
// Example test scenario
async function testAccessControl() {
  const payload = await getPayload({ config })

  const adminUser = await payload.findByID({ collection: 'users', id: 'admin-id' })
  const regularUser = await payload.findByID({ collection: 'users', id: 'user-id' })

  // Test admin can access all
  const adminAccess = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    user: adminUser,
  })

  // Test regular user access
  const userAccess = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    user: regularUser,
  })

  // Assert results
  console.log('Admin can see all posts:', adminAccess.totalDocs)
  console.log('User can see limited posts:', userAccess.totalDocs)
}
```

## Common Pitfalls

1. **Forgetting to check for undefined values** in access control functions
2. **Not testing all user roles** and scenarios
3. **Making access control too complex** - keep it simple and readable
4. **Forgetting field-level access control** when sensitive data exists
5. **Not considering locale-specific access** in multi-language applications
6. **Assuming admin access** without explicit checks
7. **Forgetting to use `overrideAccess: false`** in Local API calls

---

### Collection Access Control

This is the foundation of Payload's security model, allowing you to control who can perform what operations on your data.