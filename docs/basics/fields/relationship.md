# Relationship Field

The Relationship field is used in a variety of ways, including:

- To add Product documents to an Order document
- To allow for an Order to feature a `placedBy` relationship to either an Organization or User collection
- To assign Category documents to Post documents

To add a Relationship Field, set the type to `relationship` in your Field Config:

```typescript
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
}
```

## Config Options

| Option | Description |
|--------|-------------|
| **name** * | To be used as the property name when stored and retrieved from the database. More details. |
| **relationTo** * | Provide one or many collection slugs to be able to assign relationships to. |
| **filterOptions** | A query to filter which options appear in the UI and validate against. More details. |
| **hasMany** | Boolean when, if set to `true`, allows this field to have many relations instead of only one. |
| **minRows** | A number for the fewest allowed items during validation when a value is present. Used with `hasMany`. |
| **maxRows** | A number for the most allowed items during validation when a value is present. Used with `hasMany`. |
| **maxDepth** | Sets a maximum population depth for this field, regardless of the remaining depth when this field is reached. Max Depth |
| **label** | Text used as a field label in the Admin Panel or an object with keys for each language. |
| **unique** | Enforce that each entry in the Collection has a unique value for this field. |
| **validate** | Provide a custom validation function that will be executed on both the Admin Panel and the backend. More details. |
| **index** | Build an index for this field to produce faster queries. Set this field to `true` if your users will perform queries on this field's data often. |
| **saveToJWT** | If this field is top-level and nested in a config supporting Authentication, include its data in the user JWT. |
| **hooks** | Provide Field Hooks to control logic for this field. More details. |
| **access** | Provide Field Access Control to denote what users can see and do with this field's data. More details. |
| **hidden** | Restrict this field's visibility from all APIs entirely. Will still be saved to the database, but will not appear in any API or the Admin Panel. |
| **defaultValue** | Provide data to be used for this field's default value. More details. |
| **localized** | Enable localization for this field. Requires localization to be enabled in the Base config. |
| **required** | Require this field to have a value. |
| **admin** | Admin-specific configuration. More details. |
| **custom** | Extension point for adding custom data (e.g. for plugins) |
| **typescriptSchema** | Override field type generation with providing a JSON schema |
| **virtual** | Provide `true` to disable field in the database, or provide a string path to link the field with a relationship. See Virtual Field Configuration |
| **graphQL** | Custom graphQL configuration for the field. More details |

\* An asterisk denotes that a property is required.

**Tip**: The Depth parameter can be used to automatically populate related documents that are returned by the API.

## Admin Options

To customize the appearance and behavior of the Relationship Field in the Admin Panel, you can use the `admin` option:

```typescript
{
  name: 'categories',
  type: 'relationship',
  relationTo: 'categories',
  hasMany: true,
  admin: {
    isSortable: true,
    allowCreate: true,
    allowEdit: true,
    sortOptions: 'title',
    placeholder: 'Select categories...',
    appearance: 'select', // or 'drawer'
  },
}
```

The Relationship Field inherits all of the default admin options from the base Field Admin Config, plus the following additional options:

| Property | Description |
|----------|-------------|
| **isSortable** | Set to `true` if you'd like this field to be sortable within the Admin UI using drag and drop (only works when `hasMany` is set to `true`). |
| **allowCreate** | Set to `false` if you'd like to disable the ability to create new documents from within the relationship field. |
| **allowEdit** | Set to `false` if you'd like to disable the ability to edit documents from within the relationship field. |
| **sortOptions** | Define a default sorting order for the options within a Relationship field's dropdown. More details |
| **placeholder** | Define a custom text or function to replace the generic default placeholder |
| **appearance** | Set to `drawer` or `select` to change the behavior of the field. Defaults to `select`. |

### Sort Options

You can specify `sortOptions` in two ways:

**As a string:**

Provide a string to define a global default sort field for all relationship field dropdowns across different collections. You can prefix the field name with a minus symbol (`-`) to sort in descending order.

```typescript
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
  admin: {
    sortOptions: '-createdAt', // Sort by createdAt in descending order
  },
}
```

**As an object:**

Specify an object where keys are collection slugs and values are strings representing the field names to sort by. This allows for different sorting fields for each collection's relationship dropdown.

```typescript
{
  name: 'relatedDoc',
  type: 'relationship',
  relationTo: ['pages', 'posts', 'categories'],
  admin: {
    sortOptions: {
      pages: 'title',           // Sort pages by title (ascending)
      posts: '-publishedAt',    // Sort posts by publishedAt (descending)
      categories: 'sortOrder',  // Sort categories by sortOrder (ascending)
    },
  },
}
```

## Filtering relationship options

Options can be dynamically limited by supplying a query constraint, which will be used both for validating input and filtering available relationships in the UI.

The `filterOptions` property can either be a Where query, or a function returning `true` to not filter, `false` to prevent all, or a Where query. When using a function, it will be called with an argument object with the following properties:

| Property | Description |
|----------|-------------|
| **blockData** | The data of the nearest parent block. Will be undefined if the field is not within a block or when called on a Filter component within the list view. |
| **data** | An object containing the full collection or global document currently being edited. Will be an empty object when called on a Filter component within the list view. |
| **id** | The id of the current document being edited. Will be undefined during the create operation or when called on a Filter component within the list view. |
| **relationTo** | The collection slug to filter against, limited to this field's `relationTo` property. |
| **req** | The current request object. |
| **siblingData** | An object containing document data that is scoped to only fields within the same parent of this field. Will be an empty object when called on a Filter component within the list view. |
| **user** | An object containing the currently authenticated user. |

**Example:**

```typescript
{
  name: 'primaryCategory',
  type: 'relationship',
  relationTo: 'categories',
  filterOptions: ({ data, siblingData, user }) => {
    // Only show categories that are active
    return {
      status: { equals: 'active' },
    };
  },
}
```

**Note:**

When a relationship field has both `filterOptions` and a custom validate function, the api will not validate `filterOptions` unless you call the default relationship field validation function imported from `payload/shared` in your validate function.

## Bi-directional relationships

The relationship field on its own is used to define relationships for the document that contains the relationship field, and this can be considered as a "one-way" relationship. For example, if you have a Post that has a category relationship field on it, the related category itself will not surface any information about the posts that have the category set.

However, the relationship field can be used in conjunction with the Join field to produce powerful bi-directional relationship authoring capabilities. If you're interested in bi-directional relationships, check out the documentation for the Join field.

## How the data is saved

Given the variety of options possible within the relationship field type, the shape of the data needed for creating and updating these fields can vary. The following sections will describe the variety of data shapes that can arise from this field.

### Has One

The most simple pattern of a relationship is to use `hasMany: false` with a `relationTo` that allows for only one type of collection.

```typescript
{
  name: 'owner',
  type: 'relationship',
  relationTo: 'users',
}
```

The shape of the data to save for a document with the field configured this way would be:

```json
{
  "owner": "6031ac9e1289176380734024"
}
```

When querying documents in this collection via REST API, you could query as follows:

```
?where[owner][equals]=6031ac9e1289176380734024
```

### Has One - Polymorphic

```typescript
{
  name: 'owner',
  type: 'relationship',
  relationTo: ['users', 'organizations'],
}
```

The shape of the data to save for a document with more than one relationship type would be:

```json
{
  "owner": {
    "relationTo": "users",
    "value": "6031ac9e1289176380734024"
  }
}
```

Here is an example for how to query documents by this data (note the difference in referencing the `owner.value`):

```
?where[owner.value][equals]=6031ac9e1289176380734024
```

You can also query for documents where a field has a relationship to a specific Collection:

```
?where[owners.relationTo][equals]=organizations
```

This query would return only documents that have an owner relationship to organizations.

### Has Many

To save to the hasMany relationship field we need to send an array of IDs:

```typescript
{
  name: 'tags',
  type: 'relationship',
  relationTo: 'tags',
  hasMany: true,
}
```

```json
{
  "tags": ["6031ac9e1289176380734024", "6031ac9e1289176380734025"]
}
```

When querying documents, the format does not change for arrays:

```
?where[tags][equals]=6031ac9e1289176380734024
```

### Has Many - Polymorphic

Relationship fields with `hasMany` set to more than one kind of collections save their data as an array of objects—each containing the Collection slug as the `relationTo` value, and the related document id for the `value`:

```typescript
{
  name: 'owners',
  type: 'relationship',
  relationTo: ['users', 'organizations'],
  hasMany: true,
}
```

```json
{
  "owners": [
    {
      "relationTo": "users",
      "value": "6031ac9e1289176380734024"
    },
    {
      "relationTo": "organizations",
      "value": "6031ac9e1289176380734025"
    }
  ]
}
```

Querying is done in the same way as the earlier Polymorphic example:

```
?where[owners.value][equals]=6031ac9e1289176380734024
```

### Querying and Filtering Polymorphic Relationships

Polymorphic and non-polymorphic relationships must be queried differently because of how the related data is stored and may be inconsistent across different collections. Because of this, filtering polymorphic relationship fields from the Collection List admin UI is limited to the id value.

For a polymorphic relationship, the response will always be an array of objects. Each object will contain the `relationTo` and `value` properties.

The data can be queried by the related document ID:

```
?where[field.value][equals]=6031ac9e1289176380734024
```

Or by the related document Collection slug:

```
?where[field.relationTo][equals]=your-collection-slug
```

However, you cannot query on any field values within the related document. Since we are referencing multiple collections, the field you are querying on may not exist and break the query.

**Note:**

You cannot query on a field within a polymorphic relationship as you would with a non-polymorphic relationship.

## Best Practices

1. **Indexing**: Set `index: true` for frequently queried relationship fields
2. **Filtering**: Use `filterOptions` to limit available options based on context
3. **Performance**: Be mindful of deep population with `maxDepth`
4. **Type Safety**: Use TypeScript for better development experience
5. **User Experience**: Set proper `sortOptions` and meaningful labels

## Common Use Cases

### Post with Category

```typescript
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
  required: true,
  admin: {
    sortOptions: 'title',
  },
}
```

### Post with Multiple Tags

```typescript
{
  name: 'tags',
  type: 'relationship',
  relationTo: 'tags',
  hasMany: true,
  admin: {
    isSortable: true,
  },
}
```

### Product with Related Products

```typescript
{
  name: 'relatedProducts',
  type: 'relationship',
  relationTo: 'products',
  hasMany: true,
  filterOptions: ({ id }) => ({
    id: { not_in: [id] }, // Exclude current product
  }),
}
```

### User with Manager (Polymorphic)

```typescript
{
  name: 'manager',
  type: 'relationship',
  relationTo: ['users', 'teams'],
  admin: {
    sortOptions: {
      users: 'name',
      teams: 'name',
    },
  },
}
```