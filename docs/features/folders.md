# Folders

> **Note:** The Folders feature is currently in beta and may be subject to change in minor versions updates prior to being stable.

Folders allow you to group documents across collections, and are a great way to organize your content. Folders are built on top of relationship fields, when you enable folders on a collection, Payload adds a hidden relationship field `folders`, that relates to a folder — or no folder. Folders also have the `folder` field, allowing folders to be nested within other folders.

The configuration for folders is done in two places, the collection config and the Payload config. The collection config is where you enable folders, and the Payload config is where you configure the global folder settings.

## Folder Configuration

On the payload config, you can configure the following settings under the `folders` property:

### Type Definition

```typescript
type RootFoldersConfiguration = {
  /**
   * If true, the browse by folder view will be enabled
   *
   * @default true
   */
  browseByFolder?: boolean

  /**
   * An array of functions to be ran when the folder collection is initialized
   * This allows plugins to modify the collection configuration
   */
  collectionOverrides?: ((({ collection, }: { collection: CollectionConfig }) => CollectionConfig | Promise<CollectionConfig>))[]

  /**
   * Ability to view hidden fields and collections related to folders
   *
   * @default false
   */
  debug?: boolean

  /**
   * The Folder field name
   *
   * @default "folder"
   */
  fieldName?: string

  /**
   * Slug for the folder collection
   *
   * @default "payload-folders"
   */
  slug?: string
}
```

### Example Usage

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  folders: {
    debug: true, // optional
    collectionOverrides: [
      async ({ collection }) => {
        return collection
      },
    ], // optional
    fieldName: 'folder', // optional
    slug: 'payload-folders', // optional
  },
})
```

## Collection Configuration

To enable folders on a collection, you need to set the `admin.folders` property to `true` on the collection config. This will add a hidden relationship field to the collection that relates to a folder — or no folder.

### Type Definition

```typescript
type CollectionFoldersConfiguration =
  | boolean
  | {
      /**
       * If true, the collection will be included in the browse by folder view
       *
       * @default true
       */
      browseByFolder?: boolean
    }
```

### Example Usage

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  collections: [
    {
      slug: 'pages',
      folders: true, // defaults to false
    },
  ],
})
```

## How It Works

When you enable folders on a collection:

1. **Hidden Relationship Field**: Payload automatically adds a hidden relationship field called `folders` that links documents to folders
2. **Folder Collection**: A separate collection (default slug: `payload-folders`) is created to manage the folder structure
3. **Nested Support**: Folders can be nested within other folders using the `folder` field
4. **Browse View**: Enable browse-by-folder functionality to navigate content through folder hierarchy

## Benefits

- **Organization**: Group related content together in a hierarchical structure
- **Navigation**: Provide intuitive folder-based navigation for content editors
- **Flexibility**: Works across multiple collections with shared folder structure
- **Scalability**: Manage large amounts of content through logical grouping