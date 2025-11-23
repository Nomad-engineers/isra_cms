# Database

Payload is database agnostic, meaning you can use any type of database behind Payload's familiar APIs. Payload is designed to interact with your database through a Database Adapter, which is a thin layer that translates Payload's internal data structures into your database's native data structures.

Currently, Payload officially supports the following Database Adapters:

- **MongoDB** with [Mongoose](https://mongoosejs.com/)
- **Postgres** with [Drizzle](https://drizzle.team/)
- **SQLite** with [Drizzle](https://drizzle.team/)

To configure a Database Adapter, use the `db` property in your [Payload Config](https://payloadcms.com/docs/configuration/overview):

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'

export default buildConfig({
  // ...
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
})
```

**Reminder:** The Database Adapter is an external dependency and must be installed in your project separately from Payload. You can find the installation instructions for each Database Adapter in their respective documentation.

## Selecting a Database

There are several factors to consider when choosing which database technology and hosting option is right for your project and workload. Payload can theoretically support any database, but it's up to you to decide which database to use.

There are two main categories of databases to choose from:

- [Non-Relational Databases](https://payloadcms.com/docs/database/overview#non-relational-databases)
- [Relational Databases](https://payloadcms.com/docs/database/overview#relational-databases)

### Non-Relational Databases

If your project has a lot of dynamic fields, and you are comfortable with allowing Payload to enforce data integrity across your documents, MongoDB is a great choice. With it, your Payload documents are stored as one document in your database—no matter if you have localization enabled, how many block or array fields you have, etc. This means that the shape of your data in your database will very closely reflect your field schema, and there is minimal complexity involved in storing or retrieving your data.

You should prefer MongoDB if:

- You prefer simplicity within your database
- You don't want to deal with keeping production / staging databases in sync via [DDL changes](https://en.wikipedia.org/wiki/Data_definition_language)
- Most (or everything) in your project is [Localized](https://payloadcms.com/docs/configuration/localization)
- You leverage a lot of [Arrays](https://payloadcms.com/docs/fields/array), [Blocks](https://payloadcms.com/docs/fields/blocks), or `hasMany` [Select](https://payloadcms.com/docs/fields/select) fields

### Relational Databases

Many projects might call for more rigid database architecture where the shape of your data is strongly enforced at the database level. For example, if you know the shape of your data and it's relatively "flat", and you don't anticipate it to change often, your workload might suit relational databases like Postgres very well.

You should prefer a relational DB like Postgres or SQLite if:

- You are comfortable with [Migrations](https://payloadcms.com/docs/database/migrations)
- You require enforced data consistency at the database level
- You have a lot of relationships between collections and require relationships to be enforced

## Payload Differences

It's important to note that nearly every Payload feature is available in all of our officially supported Database Adapters, including [Localization](https://payloadcms.com/docs/configuration/localization), [Arrays](https://payloadcms.com/docs/fields/array), [Blocks](https://payloadcms.com/docs/fields/blocks), etc. The only thing that is not supported in SQLite yet is the [Point Field](https://payloadcms.com/docs/fields/point), but that should be added soon.

It's up to you to choose which database you would like to use based on the requirements of your project. Payload has no opinion on which database you should ultimately choose.

[Next: Migrations](https://payloadcms.com/docs/database/migrations)

#### Related Guides

- [How to set up Payload with SQLite and Turso](https://payloadcms.com/posts/guides/how-to-set-up-payload-with-sqlite-and-turso-for-deployment-on-vercel)
- [How to set up Payload with Supabase for your Next.js app](https://payloadcms.com/posts/guides/setting-up-payload-with-supabase-for-your-nextjs-app-a-step-by-step-guide)