# Hooks Overview

Hooks allow you to execute your own side effects during specific events of the Document lifecycle. They allow you to do things like mutate data, perform business logic, integrate with third-parties, or anything else, all during precise moments within your application.

Common use cases for Hooks include:

- Modify data before it is read or updated
- Encrypt and decrypt sensitive data
- Integrate with a third-party CRM like HubSpot or Salesforce
- Send a copy of uploaded files to Amazon S3 or similar
- Process orders through a payment provider like Stripe
- Send emails when contact forms are submitted
- Track data ownership or changes over time

Types of Hooks:

- **Root Hooks** - Global application-level hooks
- **Collection Hooks** - Hooks specific to collections
- **Global Hooks** - Hooks specific to globals
- **Field Hooks** - Hooks specific to individual fields

## Root Hooks

Root Hooks are not associated with any specific Collection, Global, or Field. They are useful for globally-oriented side effects, such as when an error occurs at the application level.

The following options are available:

| Option | Description |
|--------|-------------|
| **afterError** | Executed after an error occurs at the application level |

### afterError

The following arguments are provided to the `afterError` Hook:

| Argument | Description |
|----------|-------------|
| **error** | The error that occurred. |
| **context** | Custom context passed between Hooks. More details. |
| **graphqlResult** | The GraphQL result object, available if the hook is executed within a GraphQL context. |
| **req** | The current request object. |
| **collection** | The Collection in which this Hook is running against. This will be undefined if the hook is executed from a non-collection endpoint or GraphQL. |
| **result** | The formatted error result object, available if the hook is executed from a REST context. |

```typescript
// payload.config.ts
export default buildConfig({
  hooks: {
    afterError: [
      ({ error, context, req }) => {
        // Log all errors
        console.error('Application Error:', {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userId: req.user?.id,
        })

        // Send error to monitoring service
        if (process.env.ERROR_WEBHOOK_URL) {
          fetch(process.env.ERROR_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: error.message,
              timestamp: new Date().toISOString(),
            }),
          })
        }

        return error
      },
    ],
  },
  // ... other config
})
```

## Awaited vs. non-blocking hooks

Hooks can either block the request until they finish or run without blocking it. What matters is whether your hook returns a Promise.

**Tip**: If your hook executes a long-running task that doesn't affect the response in any way, consider offloading it to the job queue. That will free up the request to continue processing without waiting for the task to complete.

### Awaited

Blocking hooks that must complete before the request continues:

```typescript
hooks: {
  beforeChange: [
    async ({ data }) => {
      // Must complete before save
      data.slug = await generateUniqueSlug(data.title)
      return data
    },
  ],
}
```

### Non-blocking

Non-blocking hooks that run in the background:

```typescript
hooks: {
  afterChange: [
    ({ doc }) => {
      // Runs without blocking the response
      setTimeout(() => {
        sendEmailNotification(doc)
      }, 0)
      return doc
    },
  ],
}
```

## Server-only Execution

Hooks are only triggered on the server and are automatically excluded from the client-side bundle. This means that you can safely use sensitive business logic in your Hooks without worrying about exposing it to the client.

## Performance

Hooks are a powerful way to customize the behavior of your APIs, but some hooks are run very often and can add significant overhead to your requests if not optimized.

When building hooks, combine together as many of these strategies as possible to ensure your hooks are as performant as they can be.

For more performance tips, see the Performance documentation.

### Writing efficient hooks

Consider when hooks are run. One common pitfall is putting expensive logic in hooks that run very often.

For example, the `read` operation runs on every read request, so avoid putting expensive logic in a `beforeRead` or `afterRead` hook.

Instead, you might want to use a `beforeChange` or `afterChange` hook, which only runs when a document is created or updated.

```typescript
// ❌ AVOID: Expensive operation in read hook
hooks: {
  afterRead: [
    ({ doc }) => {
      // This runs on EVERY read request!
      doc.relatedData = getExpensiveRelatedData(doc.id)
      return doc
    },
  ],
},

// ✅ BETTER: Only run expensive operation when data changes
hooks: {
  afterChange: [
    ({ doc }) => {
      // This only runs when data is modified
      doc.cachedData = getExpensiveRelatedData(doc.id)
      return doc
    },
  ],
}
```

### Using Hook Context

Use Hook Context to avoid infinite loops or to prevent repeating expensive operations across multiple hooks in the same request.

To learn more, see the Hook Context documentation.

```typescript
hooks: {
  beforeChange: [
    ({ data, context }) => {
      // Check if we already performed this operation
      if (context.alreadyProcessed) {
        return data
      }

      // Mark as processed to avoid duplicate work
      context.alreadyProcessed = true

      // Perform expensive operation once
      data.processed = await expensiveOperation(data)
      return data
    },
  ],
}
```

### Offloading to the jobs queue

If your hooks perform any long-running tasks that don't directly affect the request lifecycle, consider offloading them to the jobs queue. This will free up the request to continue processing without waiting for the task to complete.

To learn more, see the Job Queue documentation.

```typescript
import { Queue } from 'bullmq'

const emailQueue = new Queue('email sending process')

hooks: {
  afterChange: [
    ({ doc }) => {
      // Offload email sending to job queue
      emailQueue.add('send-welcome-email', {
        userId: doc.id,
        email: doc.email,
      })

      return doc
    },
  ],
}
```

## Collection Hooks

Collection hooks are defined at the collection level and run on operations affecting that specific collection.

### Available Collection Hooks

| Hook | When it runs | Purpose |
|------|-------------|---------|
| **beforeRead** | Before any read operation | Modify query or hide data |
| **afterRead** | After data is read | Format or process returned data |
| **beforeChange** | Before create/update | Validate or modify data |
| **afterChange** | After create/update | Trigger side effects |
| **beforeValidate** | Before validation | Add custom validation logic |
| **beforeDelete** | Before delete | Check permissions or cleanup |
| **afterDelete** | After delete | Clean up related data |

### Collection Hook Example

```typescript
{
  slug: 'orders',
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Auto-generate order number for new orders
        if (operation === 'create') {
          data.orderNumber = generateOrderNumber()
        }

        // Calculate total from line items
        if (data.items) {
          data.total = data.items.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0
          )
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, req }) => {
        // Send confirmation email
        sendOrderConfirmationEmail(doc)

        // Sync with external CRM
        syncWithCRM(doc)

        return doc
      },
    ],
    beforeDelete: [
      ({ req }) => {
        // Check if user can delete this order
        if (req.user?.role !== 'admin') {
          throw new Error('Only admins can delete orders')
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        // Refund payment if applicable
        if (doc.paymentStatus === 'paid') {
          processRefund(doc.paymentIntentId)
        }

        // Archive order data
        archiveOrderData(doc)
      },
    ],
  },
}
```

## Global Hooks

Global hooks work similarly to collection hooks but are defined at the global level.

```typescript
{
  slug: 'settings',
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Only admins can change global settings
        if (req.user?.role !== 'admin') {
          throw new Error('Only admins can modify global settings')
        }

        // Log changes to settings
        console.log('Settings changed:', {
          changes: data,
          user: req.user.id,
          timestamp: new Date(),
        })

        return data
      },
    ],
  },
}
```

## Field Hooks

Field hooks provide even more granular control, allowing you to execute logic for specific fields only.

### Field Hook Example

```typescript
{
  name: 'password',
  type: 'text',
  hooks: {
    beforeChange: [
      ({ value, operation }) => {
        // Hash password before saving
        if (operation === 'create' || (operation === 'update' && value)) {
          return hashPassword(value)
        }

        return value
      },
    ],
    afterRead: [
      ({ value }) => {
        // Never return password hashes
        return null
      },
    ],
  },
},
{
  name: 'slug',
  type: 'text',
  hooks: {
    beforeChange: [
      ({ value, data }) => {
        // Auto-generate slug from title if not provided
        if (!value && data.title) {
          return generateSlug(data.title)
        }
        return value
      },
    ],
  },
},
{
  name: 'email',
  type: 'email',
  hooks: {
    beforeValidate: [
      ({ value }) => {
        // Additional email validation
        if (value && value.endsWith('@spam-domain.com')) {
          throw new Error('Emails from spam domains are not allowed')
        }
        return value
      },
    ],
  },
}
```

## Hook Context

Hook context allows you to pass data between hooks in the same request lifecycle:

```typescript
hooks: {
  beforeChange: [
    ({ data, context }) => {
      // Set context for other hooks to use
      context.originalData = { ...data }
      return data
    },
    ({ data, context }) => {
      // Access context from previous hook
      const changed = Object.keys(data).some(
        key => data[key] !== context.originalData[key]
      )

      if (!changed) {
        // Skip expensive processing if nothing changed
        return data
      }

      return processData(data)
    },
  ],
}
```

## Error Handling in Hooks

Always handle errors properly in hooks to prevent crashes:

```typescript
hooks: {
  beforeChange: [
    async ({ data }) => {
      try {
        // Potentially failing operation
        const result = await externalAPI.validate(data)
        return { ...data, validated: result.valid }
      } catch (error) {
        // Log error but don't crash
        console.error('External API validation failed:', error)
        throw new Error('Validation failed: ' + error.message)
      }
    },
  ],
}
```

## Best Practices

1. **Keep hooks lightweight** - Avoid heavy computations in frequently-run hooks
2. **Use context efficiently** - Pass data between hooks to avoid duplicate work
3. **Offload long tasks** - Use job queues for background processing
4. **Handle errors gracefully** - Always catch and handle potential errors
5. **Test thoroughly** - Test hooks with different scenarios and edge cases
6. **Document side effects** - Clearly document what each hook does
7. **Avoid infinite loops** - Be careful with hooks that trigger additional operations

## Common Hook Patterns

### 1. Data Transformation

```typescript
hooks: {
  beforeChange: [
    ({ data }) => {
      // Normalize phone numbers
      if (data.phoneNumber) {
        data.phoneNumber = data.phoneNumber.replace(/[^0-9]/g, '')
      }
      return data
    },
  ],
}
```

### 2. Data Validation

```typescript
hooks: {
  beforeChange: [
    ({ data }) => {
      // Business rule validation
      if (data.price < 0) {
        throw new Error('Price cannot be negative')
      }
      return data
    },
  ],
}
```

### 3. External Integration

```typescript
hooks: {
  afterChange: [
    ({ doc }) => {
      // Sync with external service
      syncToExternalService('users', doc)
      return doc
    },
  ],
}
```

### 4. Caching

```typescript
hooks: {
  beforeRead: [
    ({ context }) => {
      // Check cache first
      if (context.cacheHit) {
        return { ...context.cachedData }
      }
      return null // Continue with normal read
    },
  ],
}
```

### 5. Auditing

```typescript
hooks: {
  afterChange: [
    ({ doc, req }) => {
      // Log all changes
      auditLog.create({
        collection: 'posts',
        documentId: doc.id,
        changes: doc,
        user: req.user.id,
        timestamp: new Date(),
      })
      return doc
    },
  ],
}
```

---

### Collection Hooks

These hooks provide powerful ways to customize your application behavior while maintaining clean separation of concerns and excellent performance.