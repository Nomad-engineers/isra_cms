# Custom Components

Custom components in Payload allow you to extend the admin UI with your own React components, giving you complete control over how data is displayed and edited. This powerful feature enables you to create highly customized admin experiences tailored to your specific needs.

## Overview

Custom components can be used in several places within Payload:

- **Field Components**: Replace the default input components for fields
- **List Components**: Customize how collections are displayed in the admin
- **Edit Components**: Replace the entire edit view for a collection
- **Custom UI**: Add custom components anywhere in the admin interface

## Field Components

### Basic Field Component

You can replace the default component for any field type by providing a custom component:

```typescript
import type { FieldComponent } from 'payload'

const CustomTextField: FieldComponent = ({ field, path, readOnly, value, onChange, validate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        {field.label}
        {field.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={field.placeholder}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: readOnly ? '#f5f5f5' : 'white'
        }}
      />
    </div>
  )
}
```

### Using Custom Field Component

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        components: {
          Field: CustomTextField
        }
      }
    }
  ]
}
```

### Advanced Field Component with Dependencies

```typescript
import { useEffect, useState } from 'react'
import type { FieldComponent } from 'payload'

const CategoryField: FieldComponent = ({ field, path, formState, onChange }) => {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    // Fetch categories based on selected post type
    const postType = formState.getFieldValue('postType')
    if (postType) {
      fetchCategoriesByPostType(postType).then(setCategories)
    }
  }, [formState.getFieldValue('postType')])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <div>
      <label>{field.label}</label>
      <select onChange={handleChange}>
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

## Array Field Components

### Custom Array Row Component

```typescript
import type { ArrayRowComponent } from 'payload'

const CustomArrayRow: ArrayRowComponent = ({ fields, path, rowIndex, removeRow }) => {
  return (
    <div style={{
      padding: '1rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '0.5rem',
      position: 'relative'
    }}>
      <button
        onClick={removeRow}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer'
        }}
      >
        ×
      </button>
      <div style={{ paddingRight: '2rem' }}>
        {/* Custom rendering of array fields */}
      </div>
    </div>
  )
}
```

### Using Custom Array Components

```typescript
{
  name: 'teamMembers',
  type: 'array',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'role', type: 'text' },
    { name: 'bio', type: 'textarea' }
  ],
  admin: {
    components: {
      Row: CustomArrayRow
    }
  }
}
```

## Relationship Field Components

### Custom Relationship Component

```typescript
import { useState, useEffect } from 'react'
import type { FieldComponent } from 'payload'

const CustomRelationshipField: FieldComponent = ({ field, value, onChange, relationTo }) => {
  const [options, setOptions] = useState([])

  useEffect(() => {
    // Fetch related documents
    fetch(`/api/${relationTo}?limit=999`)
      .then(res => res.json())
      .then(data => setOptions(data.docs))
  }, [relationTo])

  const handleSelect = (selectedId: string) => {
    onChange(selectedId)
  }

  return (
    <div>
      <label>{field.label}</label>
      <select
        value={value || ''}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.title || option.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

## Custom List Components

### Custom List View Component

```typescript
import type { ListComponent } from 'payload'

const CustomList: ListComponent = ({
  collection,
  data,
  hasMany,
  limit,
  uploadData,
  onClick,
  newDocumentURL,
  toggleQueryParams
}) => {
  return (
    <div className="custom-list">
      <div className="list-header">
        <h2>{collection.labels.plural}</h2>
        {newDocumentURL && (
          <a href={newDocumentURL} className="btn-primary">
            Create New {collection.labels.singular}
          </a>
        )}
      </div>

      <div className="list-grid">
        {data.docs?.map((doc) => (
          <div key={doc.id} className="list-item" onClick={() => onClick(doc.id)}>
            <h3>{doc.title || doc.name || doc.id}</h3>
            <p className="list-item-date">
              Created: {new Date(doc.createdAt).toLocaleDateString()}
            </p>
            <div className="list-item-meta">
              <span className="status">{doc.status}</span>
              <span className="author">{doc.author?.name}</span>
            </div>
          </div>
        ))}
      </div>

      {data.hasNextPage && (
        <button
          className="load-more"
          onClick={() => toggleQueryParams({ page: data.page + 1 })}
        >
          Load More
        </button>
      )}
    </div>
  )
}

// CSS for the custom list
const customListStyles = `
.custom-list {
  padding: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.list-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.list-item:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.list-item-date {
  font-size: 0.875rem;
  color: #666;
  margin: 0.5rem 0;
}

.list-item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}
`
```

### Using Custom List Component

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    components: {
      List: CustomList
    }
  },
  fields: [
    // ...
  ]
}
```

## Custom Edit Components

### Custom Edit View Component

```typescript
import { useEffect, useState } from 'react'
import type { EditComponent } from 'payload'

const CustomEditView: EditComponent = ({
  collection,
  data,
  id,
  isLoading,
  redirect,
  save,
}) => {
  const [formData, setFormData] = useState(data)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setFormData(data)
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await save({
        id,
        data: formData,
      })
      redirect(`/${collection.slug}`)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="custom-edit-view">
      <div className="edit-header">
        <h1>
          {id ? `Edit ${collection.labels.singular}` : `Create ${collection.labels.singular}`}
        </h1>
        <div className="edit-actions">
          <button
            type="button"
            onClick={() => redirect(`/${collection.slug}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Custom form fields based on collection configuration */}
        <div className="form-field">
          <label>Title</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Content</label>
          <textarea
            value={formData.content || ''}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={10}
          />
        </div>

        <div className="form-field">
          <label>Status</label>
          <select
            value={formData.status || 'draft'}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </form>
    </div>
  )
}
```

### Using Custom Edit Component

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      Edit: CustomEditView
    }
  },
  fields: [
    // Fields are still needed for validation, hooks, etc.
  ]
}
```

## Rich Text Custom Components

### Custom Rich Text Editor Component

```typescript
import type { RichTextCustomComponent } from 'payload'

const CustomQuoteBlock: RichTextCustomComponent = ({ fields, onChange }) => {
  const handleChange = (value: any) => {
    onChange({ ...fields, quote: value })
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderLeft: '4px solid #0066cc',
      padding: '1rem',
      margin: '1rem 0',
      backgroundColor: '#f9f9f9'
    }}>
      <textarea
        value={fields.quote || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter quote text..."
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          resize: 'vertical',
          minHeight: '60px'
        }}
      />
    </div>
  )
}

const customElements = [
  {
    name: 'quote',
    Component: CustomQuoteBlock,
    label: 'Quote',
    fields: [
      {
        name: 'quote',
        type: 'textarea',
        required: true
      }
    ]
  }
]
```

### Using Custom Rich Text Elements

```typescript
{
  name: 'content',
  type: 'richText',
  admin: {
    elements: customElements
  }
}
```

## Best Practices

### 1. Performance Considerations

```typescript
// Memoize expensive computations
import React, { memo, useMemo } from 'react'

const ExpensiveField = memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveDataProcessing(data)
  }, [data])

  return <div>{/* Render processed data */}</div>
})
```

### 2. Error Handling

```typescript
const RobustComponent: FieldComponent = ({ field, value, onChange }) => {
  const [error, setError] = useState(null)

  const handleChange = async (newValue: any) => {
    try {
      await validateInput(newValue)
      onChange(newValue)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {/* Component UI */}
    </div>
  )
}
```

### 3. Accessibility

```typescript
const AccessibleField: FieldComponent = ({ field, value, onChange }) => {
  const fieldId = `field-${field.name}`

  return (
    <div>
      <label
        htmlFor={fieldId}
        id={`${fieldId}-label`}
      >
        {field.label}
      </label>
      <input
        id={fieldId}
        aria-labelledby={`${fieldId}-label`}
        aria-describedby={`${fieldId}-description`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.description && (
        <div id={`${fieldId}-description`} className="field-description">
          {field.description}
        </div>
      )}
    </div>
  )
}
```

### 4. Styling Consistency

```typescript
// Create a design system for consistent styling
const styles = {
  container: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  error: {
    color: 'red',
    fontSize: '0.875rem',
    marginTop: '0.25rem'
  }
}
```

## Testing Custom Components

### Unit Testing Example

```typescript
import { render, fireEvent, screen } from '@testing-library/react'
import CustomTextField from './CustomTextField'

describe('CustomTextField', () => {
  it('renders label and input', () => {
    render(
      <CustomTextField
        field={{ label: 'Test Field', name: 'test' }}
        value=""
        onChange={jest.fn()}
      />
    )

    expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
  })

  it('calls onChange when input changes', () => {
    const mockOnChange = jest.fn()
    render(
      <CustomTextField
        field={{ label: 'Test Field', name: 'test' }}
        value=""
        onChange={mockOnChange}
      />
    )

    const input = screen.getByLabelText('Test Field')
    fireEvent.change(input, { target: { value: 'New Value' } })

    expect(mockOnChange).toHaveBeenCalledWith('New Value')
  })
})
```

## Migration from v2 to v3

If you're migrating from Payload v2 to v3, here are the key changes for custom components:

```typescript
// v2
const FieldComponent = ({ field, value, onChange }) => {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}

// v3 (TypeScript)
import type { FieldComponent } from 'payload'

const FieldComponent: FieldComponent = ({ field, value, onChange }) => {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}
```

## Plugin Development

Custom components are essential for creating powerful Payload plugins:

```typescript
import type { Plugin } from 'payload'

const customComponentsPlugin: Plugin = {
  name: 'custom-components',
  admin: {
    components: {
      // Provide components that can be used throughout the admin
      CustomComponent: CustomTextField
    }
  },
  // Plugin implementation
}

export default customComponentsPlugin
```

Custom components give you complete control over the admin experience, allowing you to create tailored interfaces that perfectly match your application's needs while maintaining Payload's powerful core functionality.