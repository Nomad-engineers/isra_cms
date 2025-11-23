# Versions

Payload's Versions feature provides a complete versioning and content history system for your collections and globals. This powerful feature allows you to track changes, restore previous versions, and maintain a complete audit trail of all document modifications.

## Overview

The Versions feature in Payload enables you to:

- **Track Changes**: Automatically create versions whenever documents are modified
- **Restore Previous Versions**: Restore documents to any previous state
- **View Version History**: See a complete timeline of all changes made to documents
- **Compare Versions**: View differences between versions
- **Customize Version Retention**: Control how many versions are kept
- **Conditional Versioning**: Choose when versions are created based on your business rules

## Configuration

### Basic Version Setup

To enable versions for a collection or global:

```typescript
import type { CollectionConfig, GlobalConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  versions: {
    drafts: {
      draft: {
        // Enable draft versions
      }
    }
  },
  fields: [
    // Your fields here
  ]
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  versions: {
    // Enable versions for this global
  },
  fields: [
    // Your fields here
  ]
}
```

### Advanced Version Configuration

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  versions: {
    drafts: {
      draft: {
        // Enable draft mode with versioning
      }
    },
    max: 50, // Keep maximum 50 versions per document
  },
  fields: [
    // Your fields here
  ]
}
```

### Version Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `drafts.draft` | boolean | `false` | Enable draft versions for this collection |
| `max` | number | `10` | Maximum number of versions to keep per document |
| `drafts.autosave` | boolean | `false` | Enable automatic saving of drafts |
| `drafts.validate` | boolean | `true` | Validate draft data before saving |

## Draft Mode with Versions

When you enable drafts with versioning, Payload creates a sophisticated content workflow:

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  versions: {
    drafts: {
      draft: true,
      autosave: true,
    }
  },
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
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
  ]
}
```

### Publishing Workflow

```typescript
// Publishing process with versions
const publishPost = async (postId: string) => {
  const payload = await getPayload({ config })

  // Update status to published
  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      status: 'published'
    }
  })

  // This automatically creates a new version
  const versions = await payload.find({
    collection: 'posts-versions', // Versions collection
    where: {
      parent: {
        equals: postId
      }
    },
    sort: '-createdAt'
  })

  console.log(`Created version ${versions.docs[0].versionNumber}`)
}
```

## Working with Versions

### Finding Versions

```typescript
// Get all versions for a specific document
const getPostVersions = async (postId: string) => {
  const payload = await getPayload({ config })

  const versions = await payload.find({
    collection: 'posts-versions',
    where: {
      parent: {
        equals: postId
      }
    },
    sort: '-createdAt'
  })

  return versions
}

// Get a specific version
const getSpecificVersion = async (postId: string, versionId: string) => {
  const payload = await getPayload({ config })

  const version = await payload.findByID({
    collection: 'posts-versions',
    id: versionId
  })

  return version
}
```

### Restoring Versions

```typescript
// Restore a document to a specific version
const restoreVersion = async (postId: string, versionId: string) => {
  const payload = await getPayload({ config })

  // Get the version to restore
  const version = await payload.findByID({
    collection: 'posts-versions',
    id: versionId
  })

  // Restore the version
  await payload.restoreVersion({
    collection: 'posts',
    id: postId,
    versionId: versionId
  })

  console.log(`Document restored to version ${version.versionNumber}`)
}
```

### Comparing Versions

```typescript
// Compare two versions
const compareVersions = async (versionId1: string, versionId2: string) => {
  const payload = await getPayload({ config })

  const [version1, version2] = await Promise.all([
    payload.findByID({
      collection: 'posts-versions',
      id: versionId1
    }),
    payload.findByID({
      collection: 'posts-versions',
      id: versionId2
    })
  ])

  // Compare fields
  const differences = []

  for (const field of Object.keys(version1.versionData)) {
    if (version1.versionData[field] !== version2.versionData[field]) {
      differences.push({
        field,
        oldValue: version1.versionData[field],
        newValue: version2.versionData[field]
      })
    }
  }

  return differences
}
```

## Version Hooks

Payload provides hooks that fire specifically for version-related operations:

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  versions: {
    drafts: {
      draft: true
    }
  },
  hooks: {
    beforeVersionSave: [
      async ({ data, version }) => {
        // Modify data before saving version
        data.lastModifiedBy = version.req.user.id

        return data
      }
    ],
    afterVersionSave: [
      async ({ version, previousVersion }) => {
        // Send notification when important changes are made
        if (previousVersion.versionData.status !== version.versionData.status) {
          await sendStatusChangeNotification(version)
        }
      }
    ],
    beforeVersionRestore: [
      async ({ version, req }) => {
        // Check if user has permission to restore this version
        if (!hasRestorePermission(req.user, version)) {
          throw new Error('Insufficient permissions to restore this version')
        }
      }
    ],
    afterVersionRestore: [
      async ({ version, req }) => {
        // Log the restore action
        await logVersionRestore(version, req.user)
      }
    ]
  },
  fields: [
    // Your fields here
  ]
}
```

## Access Control for Versions

You can control who can view, create, and restore versions:

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  versions: {
    drafts: {
      draft: true
    }
  },
  access: {
    read: ({ req }) => {
      if (req.user.role === 'admin') return true
      if (req.user.role === 'editor') return true
      return false
    },
    create: ({ req }) => {
      if (req.user.role === 'admin') return true
      if (req.user.role === 'editor') return true
      return false
    },
    update: ({ req }) => {
      if (req.user.role === 'admin') return true
      if (req.user.role === 'editor') return true
      return false
    },
    delete: ({ req }) => {
      // Only admins can delete posts (and their versions)
      return req.user.role === 'admin'
    }
  },
  versions: {
    drafts: {
      draft: true
    }
  },
  hooks: {
    beforeRead: [
      // Filter versions based on user permissions
      ({ req }) => {
        if (req.user.role === 'admin') return null // No filtering
        if (req.user.role === 'editor') return {
          status: {
            not_equals: 'archived' // Don't show archived versions
          }
        }
        return {
          createdByID: {
            equals: req.user.id
          }
        }
      }
    ]
  }
}
```

## API Endpoints

### REST API

Payload automatically creates REST endpoints for versions:

```typescript
// GET /api/posts-versions?where[parent][equals]=POST_ID
const response = await fetch('/api/posts-versions?where[parent][equals]=12345')
const versions = await response.json()

// GET /api/posts-versions/VERSION_ID
const response = await fetch('/api/posts-versions/67890')
const version = await response.json()

// POST /api/posts/POST_ID/restore-version
const response = await fetch('/api/posts/12345/restore-version', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ versionId: '67890' })
})
```

### GraphQL API

```graphql
# Find versions
query GetPostVersions($postId: ID!) {
  postsVersions(where: { parent: { equals: $postId } }) {
    docs {
      id
      versionNumber
      createdAt
      updatedAt
      versionData
    }
  }
}

# Restore version
mutation RestorePostVersion($postId: ID!, $versionId: ID!) {
  restorePostVersion(id: $postId, versionId: $versionId) {
    id
    title
    content
  }
}
```

### Local API

```typescript
// Find versions
const versions = await payload.find({
  collection: 'posts-versions',
  where: {
    parent: {
      equals: '12345'
    }
  }
})

// Restore version
const result = await payload.restoreVersion({
  collection: 'posts',
  id: '12345',
  versionId: '67890'
})
```

## Custom Version Logic

### Conditional Version Creation

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  versions: {
    drafts: {
      draft: true
    }
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation }) => {
        // Only create versions for significant changes
        if (operation === 'create') {
          // Always create a version for new documents
          return data
        }

        if (operation === 'update') {
          const significantChanges = ['title', 'content', 'status']
          const hasSignificantChanges = significantChanges.some(
            field => data[field] !== originalDoc?.[field]
          )

          if (hasSignificantChanges) {
            // Set a flag to create a version
            data._createVersion = true
          }
        }

        return data
      }
    ]
  },
  fields: [
    // Your fields here
  ]
}
```

### Custom Version Metadata

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  versions: {
    drafts: {
      draft: true
    }
  },
  hooks: {
    beforeVersionSave: [
      async ({ data, version }) => {
        // Add custom metadata to the version
        return {
          ...data,
          _versionMeta: {
            modifiedBy: version.req.user?.name || 'Unknown',
            changeReason: version.req.body?.changeReason || '',
            affectedFields: getChangedFields(data, version.previousVersion?.versionData),
            systemInfo: {
              userAgent: version.req.headers['user-agent'],
              ip: version.req.ip
            }
          }
        }
      }
    ]
  }
}
```

## Managing Version Storage

### Database Considerations

```typescript
// For large collections, consider database optimization
export const LargeCollection: CollectionConfig = {
  slug: 'large-collection',
  versions: {
    drafts: {
      draft: true
    },
    max: 5 // Keep fewer versions for performance
  },
  hooks: {
    afterVersionSave: [
      async ({ version }) => {
        // Archive old versions to cold storage
        if (version.versionNumber > 100) {
          await archiveOldVersion(version.id)
        }
      }
    ]
  }
}
```

### Version Cleanup

```typescript
// Automatic cleanup of old versions
const cleanupOldVersions = async () => {
  const payload = await getPayload({ config })

  // Get all collections with versions enabled
  const collections = ['posts', 'pages', 'products']

  for (const collection of collections) {
    const oldVersions = await payload.find({
      collection: `${collection}-versions`,
      where: {
        createdAt: {
          less_than: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year old
        }
      },
      limit: 1000 // Process in batches
    })

    for (const version of oldVersions.docs) {
      await payload.delete({
        collection: `${collection}-versions`,
        id: version.id
      })
    }
  }
}
```

## Frontend Integration

### Version History Component

```typescript
import React, { useState, useEffect } from 'react'
import type { Post } from '../types'

const VersionHistory: React.FC<{ postId: string }> = ({ postId }) => {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVersions()
  }, [postId])

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/posts-versions?where[parent][equals]=${postId}`)
      const data = await response.json()
      setVersions(data.docs)
    } catch (error) {
      console.error('Failed to fetch versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const restoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version?')) {
      return
    }

    try {
      await fetch(`/api/posts/${postId}/restore-version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId })
      })

      window.location.reload()
    } catch (error) {
      console.error('Failed to restore version:', error)
    }
  }

  if (loading) {
    return <div>Loading version history...</div>
  }

  return (
    <div className="version-history">
      <h3>Version History</h3>
      {versions.length === 0 ? (
        <p>No versions available</p>
      ) : (
        <ul className="version-list">
          {versions.map((version) => (
            <li key={version.id} className="version-item">
              <div className="version-info">
                <strong>Version {version.versionNumber}</strong>
                <span className="version-date">
                  {new Date(version.createdAt).toLocaleString()}
                </span>
                <span className="version-author">
                  {version.createdBy?.name || 'Unknown'}
                </span>
              </div>
              {version._versionMeta?.changeReason && (
                <p className="change-reason">{version._versionMeta.changeReason}</p>
              )}
              <button
                onClick={() => restoreVersion(version.id)}
                className="restore-button"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default VersionHistory
```

## Best Practices

### 1. Version Retention Strategy

```typescript
// Smart version retention based on importance
export const ImportantContent: CollectionConfig = {
  slug: 'important-content',
  versions: {
    drafts: { draft: true },
    max: 100 // Keep more versions for important content
  }
}

export const TemporaryContent: CollectionConfig = {
  slug: 'temporary-content',
  versions: {
    drafts: { draft: true },
    max: 3 // Keep fewer versions for temporary content
  }
}
```

### 2. Performance Optimization

```typescript
// Use hooks to optimize version creation
export const OptimizedPosts: CollectionConfig = {
  slug: 'posts',
  versions: {
    drafts: { draft: true },
    max: 25
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation }) => {
        // Skip version creation for minor changes
        if (operation === 'update') {
          const isMinorChange = isMinorContentChange(data, originalDoc)
          if (isMinorChange) {
            data._skipVersion = true
          }
        }
        return data
      }
    ]
  }
}
```

### 3. Security Considerations

```typescript
// Secure version access
export const SecurePosts: CollectionConfig = {
  slug: 'posts',
  versions: {
    drafts: { draft: true }
  },
  access: {
    read: ({ req }) => {
      // Only allow version access to authorized users
      return req.user?.permissions?.includes('view-versions')
    }
  },
  hooks: {
    beforeVersionRestore: [
      async ({ version, req }) => {
        // Log all restore attempts
        await logVersionRestoreAttempt(version.id, req.user?.id, req.ip)

        // Require admin approval for sensitive restores
        if (version.versionData.status === 'published' && req.user?.role !== 'admin') {
          throw new Error('Admin approval required to restore published versions')
        }
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues

1. **Too Many Versions**: Set a reasonable `max` limit to prevent database bloat
2. **Slow Performance**: Optimize database indexes on the versions collection
3. **Missing Versions**: Check access control settings and hooks that might skip version creation
4. **Large Version Data**: Use selective field updates to minimize version size

The Versions feature provides a powerful content management workflow that ensures content integrity while maintaining flexibility for your specific business needs.