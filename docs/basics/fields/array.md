# Array Field

The Array Field is used when you need to have a set of "repeating" Fields. It stores an array of objects containing fields that you define. These fields can be of any type, including other arrays, to achieve infinitely nested data structures.

Arrays are useful for many different types of content from simple to complex, such as:

- A "slider" with an image (upload field) and a caption (text field)
- Navigational structures where editors can specify nav items containing pages (relationship field), an "open in new tab" checkbox field
- Event agenda "timeslots" where you need to specify start & end time (date field), label (text field), and Learn More page relationship

To create an Array Field, set the type to `array` in your Field Config:

```typescript
{
  name: 'slider',
  type: 'array',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
  ],
}
```

## Config Options

| Option | Description |
|--------|-------------|
| **name** * | To be used as the property name when stored and retrieved from the database. More details. |
| **label** | Text used as the heading in the Admin Panel or an object with keys for each language. Auto-generated from `name` if not defined. |
| **fields** * | Array of field types to correspond to each row of the Array. |
| **validate** | Provide a custom validation function that will be executed on both the Admin Panel and the backend. More details. |
| **minRows** | A number for the fewest allowed items during validation when a value is present. |
| **maxRows** | A number for the most allowed items during validation when a value is present. |
| **saveToJWT** | If this field is top-level and nested in a config supporting Authentication, include its data in the user JWT. |
| **hooks** | Provide Field Hooks to control logic for this field. More details. |
| **access** | Provide Field Access Control to denote what users can see and do with this field's data. More details. |
| **hidden** | Restrict this field's visibility from all APIs entirely. Will still be saved to the database, but will not appear in any API or the Admin Panel. |
| **defaultValue** | Provide an array of row data to be used for this field's default value. More details. |
| **localized** | Enable localization for this field. Requires localization to be enabled in the Base config. If enabled, a separate, localized set of all data within this Array will be kept, so there is no need to specify each nested field as localized. |
| **required** | Require this field to have a value. |
| **labels** | Customize the row labels appearing in the Admin dashboard. |
| **admin** | Admin-specific configuration. More details. |
| **custom** | Extension point for adding custom data (e.g. for plugins) |
| **interfaceName** | Create a top level, reusable Typescript interface & GraphQL type. |
| **dbName** | Custom table name for the field when using SQL Database Adapter (Postgres). Auto-generated from `name` if not defined. |
| **typescriptSchema** | Override field type generation with providing a JSON schema |
| **virtual** | Provide `true` to disable field in the database, or provide a string path to link the field with a relationship. See Virtual Fields |

\* An asterisk denotes that a property is required.

## Admin Options

To customize the appearance and behavior of the Array Field in the Admin Panel, you can use the `admin` option:

```typescript
{
  name: 'slider',
  type: 'array',
  admin: {
    initCollapsed: true, // Start with array collapsed
    isSortable: true,    // Enable row sorting
    components: {
      RowLabel: ({ data, index }) => {
        // Custom row label component
        return data.title || `Slide ${index + 1}`;
      },
    },
  },
  fields: [
    // ... fields
  ],
}
```

The Array Field inherits all of the default admin options from the base Field Admin Config, plus the following additional options:

| Option | Description |
|--------|-------------|
| **initCollapsed** | Set the initial collapsed state |
| **components.RowLabel** | React component to be rendered as the label on the array row. Example |
| **isSortable** | Disable order sorting by setting this value to `false` |

## Example

In this example, we have an Array Field called `slider` that contains a set of fields for a simple image slider. Each row in the array has a title, image, and caption. We also customize the row label to display the title if it exists, or a default label if it doesn't.

```typescript
{
  name: 'slider',
  type: 'array',
  labels: {
    singular: 'Slide',
    plural: 'Slides',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
  ],
  admin: {
    components: {
      RowLabel: ({ data, index }) => {
        return data.title || `Slide ${index + 1}`;
      },
    },
  },
}
```

## Custom Components

### Field

#### Server Component

```typescript
import { ArrayFieldClientComponent } from '@payloadcms/ui'

const CustomArrayField: React.FC<ArrayFieldClientComponent> = (props) => {
  // Custom array field implementation
  return <div>Custom Array Field</div>
}
```

#### Client Component

```typescript
'use client'

import { ArrayFieldClientComponent } from '@payloadcms/ui'

const CustomArrayFieldClient: React.FC<ArrayFieldClientComponent> = (props) => {
  // Custom client-side array field
  return <div>Custom Client Array Field</div>
}
```

### Label

#### Server Component

```typescript
import { ArrayFieldLabelClientComponent } from '@payloadcms/ui'

const CustomArrayLabel: React.FC<ArrayFieldLabelClientComponent> = (props) => {
  return <span>Custom Array Label</span>
}
```

#### Client Component

```typescript
'use client'

import { ArrayFieldLabelClientComponent } from '@payloadcms/ui'

const CustomArrayLabelClient: React.FC<ArrayFieldLabelClientComponent> = (props) => {
  return <span>Custom Client Array Label</span>
}
```

### Row Label

```typescript
const CustomRowLabel = ({ data, index }) => {
  return data.name || `Item ${index + 1}`
}
```

## Best Practices

1. **Validation**: Use `minRows` and `maxRows` to control array size
2. **Performance**: Be mindful of deeply nested arrays as they can impact performance
3. **Localization**: When using localization on arrays, all nested fields are automatically localized
4. **Type Safety**: Use `interfaceName` to create reusable TypeScript interfaces
5. **User Experience**: Provide meaningful row labels to improve the admin experience

## Common Use Cases

### Image Gallery

```typescript
{
  name: 'gallery',
  type: 'array',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
  ],
}
```

### Navigation Menu

```typescript
{
  name: 'navigation',
  type: 'array',
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'link',
      type: 'relationship',
      relationTo: 'pages',
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
```