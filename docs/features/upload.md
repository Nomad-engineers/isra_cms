# Upload

Payload's Upload field provides powerful file management capabilities that integrate seamlessly with your collections and globals. This feature allows you to handle file uploads, manage media assets, and build sophisticated file-based workflows.

## Overview

The Upload field enables you to:

- **File Upload**: Handle single or multiple file uploads
- **Image Processing**: Automatic image resizing and optimization
- **Storage Adapters**: Use local storage, S3, Cloudinary, or custom storage
- **File Management**: Organize files into folders and manage permissions
- **Media Library**: Built-in media browsing and selection interface
- **File Validation**: Restrict file types, sizes, and dimensions
- **Custom Processing**: Add custom image processing or file manipulation

## Basic Upload Configuration

### Simple Upload Field

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media', // Self-reference for single upload
      required: true,
    },
  ],
}
```

### Upload to Separate Media Collection

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true, // Allow multiple files
    },
  ],
}
```

## Media Collection Configuration

A well-configured media collection is the foundation for file management:

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
  },
  access: {
    read: () => true, // Public read access for media
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media', // Self-reference
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Important for SEO and accessibility',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'media-tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  upload: {
    // Specific upload configuration
  },
}
```

## Upload Configuration Options

### File Size and Type Restrictions

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        crop: 'center',
      },
      {
        name: 'medium',
        width: 800,
        height: 600,
      },
      {
        name: 'large',
        width: 1920,
        height: 1080,
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'application/pdf',
    ],
    fileSize: {
      maxBytes: 10 * 1024 * 1024, // 10MB
    },
  },
  fields: [
    // Your fields here
  ],
}
```

### Upload Field Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `imageSizes` | array | `[]` | Define image resize dimensions |
| `adminThumbnail` | string | `null` | Which image size to use in admin |
| `mimeTypes` | array | `[]` | Allowed file types |
| `fileSize.maxBytes` | number | `null` | Maximum file size in bytes |
| `resizeOptions` | object | `{}` | Sharp.js resize options |
| `disableLocalStorage` | boolean | `false` | Disable local storage adapter |
| `staticURL` | string | `null` | Custom static URL for files |
| `staticDir` | string | `null` | Custom static directory path |

## Image Processing

### Custom Image Sizes

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    imageSizes: [
      // Square thumbnails
      {
        name: 'thumbnail',
        width: 150,
        height: 150,
        crop: 'center',
      },
      // Social media images
      {
        name: 'social',
        width: 1200,
        height: 630,
        crop: 'entropy',
      },
      // Responsive images
      {
        name: 'small',
        width: 400,
        height: 300,
      },
      {
        name: 'medium',
        width: 800,
        height: 600,
      },
      {
        name: 'large',
        width: 1600,
        height: 1200,
      },
      // Hero banners
      {
        name: 'hero',
        width: 2560,
        height: 1440,
        crop: 'center',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    // Your fields here
  ],
}
```

### Advanced Image Processing

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    imageSizes: [
      {
        name: 'optimized',
        width: 1920,
        height: 1080,
        crop: 'center',
        formatOptions: {
          jpeg: {
            quality: 85,
            progressive: true,
          },
          webp: {
            quality: 80,
          },
        },
      },
    ],
    resizeOptions: {
      // Sharp.js options
      fit: 'cover',
      position: 'center',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  },
  fields: [
    // Your fields here
  ],
}
```

## Storage Adapters

### Local Storage

```typescript
import path from 'path'
import { buildConfig } from 'payload/config'

export default buildConfig({
  upload: {
    disableLocalStorage: false, // Enable local storage
  },
  collections: [
    {
      slug: 'media',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          upload: {
            staticURL: '/media',
            staticDir: path.resolve(__dirname, '../media'),
          },
        },
      ],
    },
  ],
})
```

### S3 Storage

```typescript
import { buildConfig } from 'payload/config'
import { s3Adapter } from '@payloadcms/storage-s3'

export default buildConfig({
  upload: {
    adapter: s3Adapter({
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
      },
      bucket: process.env.S3_BUCKET,
    }),
  },
  collections: [
    {
      slug: 'media',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
})
```

### Cloudinary Storage

```typescript
import { buildConfig } from 'payload/config'
import { cloudinaryAdapter } from '@payloadcms/storage-cloudinary'

export default buildConfig({
  upload: {
    adapter: cloudinaryAdapter({
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      },
    }),
  },
  collections: [
    {
      slug: 'media',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
})
```

## Advanced Upload Features

### Multiple Upload Types

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Document', value: 'document' },
        { label: 'Audio', value: 'audio' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'dimensions',
      type: 'group',
      fields: [
        {
          name: 'width',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'height',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
      admin: {
        condition: (data) => data.type === 'image',
        position: 'sidebar',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        afterRead: [
          async ({ data }) => {
            // Extract video duration
            if (data.type === 'video') {
              return await getVideoDuration(data.file.url)
            }
            return null
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-detect file type
        if (!data.type && data.file) {
          const mimeType = data.file.mimeType
          if (mimeType.startsWith('image/')) {
            data.type = 'image'
          } else if (mimeType.startsWith('video/')) {
            data.type = 'video'
          } else if (mimeType.startsWith('audio/')) {
            data.type = 'audio'
          } else {
            data.type = 'document'
          }
        }

        // Extract image dimensions
        if (data.type === 'image' && !data.dimensions) {
          const dimensions = await getImageDimensions(data.file.url)
          data.dimensions = {
            width: dimensions.width,
            height: dimensions.height,
          }
        }

        return data
      },
    ],
  },
}
```

### File Validation and Processing

```typescript
import { createReadStream } from 'fs'
import { pipeline } from 'stream/promises'
import { createHash } from 'crypto'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'video/mp4',
    ],
    fileSize: {
      maxBytes: 50 * 1024 * 1024, // 50MB
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data.file) return data

        // Generate file hash for deduplication
        const fileHash = await generateFileHash(data.file.url)
        data.fileHash = fileHash

        // Check for duplicates
        const existingFile = await req.payload.find({
          collection: 'media',
          where: {
            fileHash: {
              equals: fileHash
            }
          },
          limit: 1
        })

        if (existingFile.docs.length > 0) {
          throw new Error('A file with identical content already exists')
        }

        // Validate image dimensions
        if (data.file.mimeType.startsWith('image/')) {
          const dimensions = await getImageDimensions(data.file.url)
          if (dimensions.width < 100 || dimensions.height < 100) {
            throw new Error('Image must be at least 100x100 pixels')
          }
          data.dimensions = dimensions
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        // Create thumbnail for videos
        if (doc.type === 'video') {
          await createVideoThumbnail(doc.file.url, doc.id)
        }

        // Extract text from PDFs for search
        if (doc.file.mimeType === 'application/pdf') {
          const text = await extractPDFText(doc.file.url)
          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              searchableText: text
            }
          })
        }
      },
    ],
  },
  fields: [
    // Your fields here
  ],
}

// Helper functions
async function generateFileHash(url: string): Promise<string> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return createHash('sha256').update(Buffer.from(buffer)).digest('hex')
}

async function getImageDimensions(url: string): Promise<{ width: number, height: number }> {
  // Use sharp or another image processing library
  const metadata = await sharp(url).metadata()
  return {
    width: metadata.width,
    height: metadata.height
  }
}
```

## Frontend Integration

### File Upload Component

```typescript
import React, { useState, useCallback } from 'react'
import type { Post } from '../types'

interface FileUploadProps {
  value?: any
  onChange: (files: any[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  maxSize?: number
}

const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  maxFiles = 1,
  acceptedTypes = 'image/*,.pdf',
  maxSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const handleFileSelect = useCallback(async (files: FileList) => {
    setError('')
    setUploading(true)
    setProgress(0)

    try {
      const uploadPromises = Array.from(files).slice(0, maxFiles).map(async (file) => {
        // Validate file size
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} is too large`)
        }

        // Create form data
        const formData = new FormData()
        formData.append('file', file)

        // Upload file
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        setProgress((prev) => prev + 100 / files.length)
        return result.doc
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      onChange([...(value || []), ...uploadedFiles])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [value, onChange, maxFiles, maxSize])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
  }, [handleFileSelect])

  return (
    <div className="file-upload">
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <input
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes}
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
          {uploading ? (
            <div>
              <div>Uploading... {Math.round(progress)}%</div>
              <div className="progress-bar" style={{
                width: '100%',
                height: '10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '5px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#4CAF50',
                }} />
              </div>
            </div>
          ) : (
            <div>
              <div>Drop files here or click to browse</div>
              <small>
                Max {maxFiles} file{maxFiles > 1 ? 's' : ''},
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </small>
            </div>
          )}
        </label>
      </div>

      {error && (
        <div className="error" style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {value && value.length > 0 && (
        <div className="file-list" style={{ marginTop: '1rem' }}>
          <h4>Uploaded Files:</h4>
          {value.map((file: any) => (
            <div key={file.id} className="file-item" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}>
              {file.mimeType?.startsWith('image/') ? (
                <img
                  src={file.url}
                  alt={file.filename}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    marginRight: '1rem'
                  }}
                />
              ) : (
                <div className="file-icon" style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}>
                  📄
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div>{file.filename}</div>
                <small>{file.fileSize ? `${Math.round(file.fileSize / 1024)}KB` : ''}</small>
              </div>
              <button
                onClick={() => {
                  const newFiles = value.filter((f: any) => f.id !== file.id)
                  onChange(newFiles)
                }}
                style={{
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload
```

## API Usage

### Upload Files via REST API

```typescript
// Upload a file
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/media', {
    method: 'POST',
    headers: {
      'Authorization': `JWT ${token}`,
    },
    body: formData,
  })

  const result = await response.json()
  return result.doc
}

// Upload multiple files
const uploadMultipleFiles = async (files: File[]) => {
  const uploadPromises = files.map(file => uploadFile(file))
  const uploadedFiles = await Promise.all(uploadPromises)
  return uploadedFiles
}
```

### Upload via GraphQL

```graphql
mutation UploadFile($file: Upload!) {
  createMedia(data: { file: $file }) {
    id
    filename
    url
    mimeType
    fileSize
  }
}
```

### Local API Upload

```typescript
const uploadFileLocally = async (file: File) => {
  const payload = await getPayload({ config })

  // Note: Local API doesn't directly handle file uploads
  // You would typically use the REST API for uploads
  // Then use Local API for other operations

  const response = await fetch('/api/media', {
    method: 'POST',
    body: formData,
  })

  const result = await response.json()

  // Use Local API to update related documents
  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      featuredImage: result.doc.id
    }
  })
}
```

## Best Practices

### 1. File Organization

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  fields: [
    {
      name: 'folder',
      type: 'relationship',
      relationTo: 'media-folders',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      upload: {
        // Organize files by date and folder
        staticURL: (args) => {
          const date = new Date()
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          const folder = args.req.data?.folder?.name || 'uncategorized'
          return `/media/${year}/${month}/${folder}`
        }
      }
    },
  ],
}
```

### 2. Image Optimization

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    imageSizes: [
      // WebP versions for modern browsers
      {
        name: 'webp-medium',
        width: 800,
        height: 600,
        formatOptions: {
          webp: {
            quality: 80,
            effort: 4, // Compression effort (0-6)
            smartSubsample: true,
          }
        }
      },
      // JPEG for compatibility
      {
        name: 'jpg-medium',
        width: 800,
        height: 600,
        formatOptions: {
          jpeg: {
            quality: 85,
            progressive: true,
            mozjpeg: true,
          }
        }
      },
    ],
  },
  fields: [
    // Your fields here
  ],
}
```

### 3. Security Considerations

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: ({ req }) => {
      // Only authenticated users can upload
      if (!req.user) return false
      // Rate limiting could be implemented here
      return true
    },
    read: ({ req }) => {
      // Public read access for published content
      if (req.query?.published === 'true') return true
      // Otherwise, require authentication
      return !!req.user
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Sanitize filename
        if (data.file?.filename) {
          data.file.filename = sanitizeFilename(data.file.filename)
        }

        // Add uploaded by user
        data.uploadedBy = req.user?.id

        return data
      },
    ],
  },
  fields: [
    // Your fields here
  ],
}

function sanitizeFilename(filename: string): string {
  // Remove special characters, preserve extensions
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}
```

The Upload feature provides comprehensive file management capabilities that can handle everything from simple image uploads to complex media workflows with multiple storage adapters and processing pipelines.