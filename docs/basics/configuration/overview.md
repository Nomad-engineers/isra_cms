# The Payload Config

Payload is a config-based, code-first CMS and application framework. The Payload Config is central to everything that Payload does, allowing for deep configuration of your application through a simple and intuitive API. The Payload Config is a fully-typed JavaScript object that can be infinitely extended upon.

Everything from your [Database](https://payloadcms.com/docs/database/overview) choice to the appearance of the [Admin Panel](https://payloadcms.com/docs/admin/overview) is fully controlled through the Payload Config. From here you can define [Fields](https://payloadcms.com/docs/fields/overview) Fields, add [Localization](https://payloadcms.com/docs/configuration/localization) Localization, enable [Authentication](https://payloadcms.com/docs/authentication/overview) Authentication, configure [Access Control](https://payloadcms.com/docs/access-control/overview) Access Control, and so much more.

The Payload Config is a `payload.config.ts` file typically located in the root of your project:

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // Your config goes here
})
```

The Payload Config is strongly typed and ties directly into Payload's TypeScript codebase. This means your IDE (such as VSCode) will provide helpful information like type-ahead suggestions while you write your config.

**Tip:** The location of your Payload Config can be customized. [More details](https://payloadcms.com/docs/configuration/overview#customizing-the-config-location).

## Config Options

To author your Payload Config, first determine which [Database](https://payloadcms.com/docs/database/overview) you'd like to use, then use [Collections](https://payloadcms.com/docs/configuration/collections) Collections or [Globals](https://payloadcms.com/docs/configuration/globals) Globals to define the schema of your data through [Fields](https://payloadcms.com/docs/fields/overview) Fields.

Here is one of the simplest possible Payload configs:

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  collections: [
    {
      slug: 'pages',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
      ],
    },
  ],
})
```

**Note:** For more complex examples, see the [Templates](https://github.com/payloadcms/payload/tree/main/templates) Templates and [Examples](https://github.com/payloadcms/payload/tree/main/examples) Examples directories in the Payload repository.

The following options are available:

| Option | Description |
|--------|-------------|
| `admin` | The configuration options for the Admin Panel, including Custom Components, Live Preview, etc. [More details](https://payloadcms.com/docs/admin/overview#admin-options) |
| `bin` | Register custom bin scripts for Payload to execute. [More Details](https://payloadcms.com/docs/configuration/overview#custom-bin-scripts) |
| `editor` | The Rich Text Editor which will be used by `richText` fields. [More details](https://payloadcms.com/docs/rich-text/overview) |
| `db`* | The Database Adapter which will be used by Payload. [More details](https://payloadcms.com/docs/database/overview) |
| `serverURL` | A string used to define the absolute URL of your app. This includes the protocol, for example `https://example.com`. No paths allowed, only protocol, domain and (optionally) port. |
| `collections` | An array of Collections for Payload to manage. [More details](https://payloadcms.com/docs/configuration/collections) |
| `compatibility` | Compatibility flags for earlier versions of Payload. [More details](https://payloadcms.com/docs/configuration/overview#compatibility-flags) |
| `globals` | An array of Globals for Payload to manage. [More details](https://payloadcms.com/docs/configuration/globals) |
| `cors` | Cross-origin resource sharing (CORS) is a mechanism that accept incoming requests from given domains. You can also customize the `Access-Control-Allow-Headers` header. [More details](https://payloadcms.com/docs/configuration/overview#cors) |
| `localization` | Opt-in to translate your content into multiple locales. [More details](https://payloadcms.com/docs/configuration/localization) |
| `logger` | Logger options, logger options with a destination stream, or an instantiated logger instance. [More details](https://getpino.io/#/docs/api?id=options) |
| `loggingLevels` | An object to override the level to use in the logger for Payload's errors. |
| `graphQL` | Manage GraphQL-specific functionality, including custom queries and mutations, query complexity limits, etc. [More details](https://payloadcms.com/docs/graphql/overview#graphql-options) |
| `cookiePrefix` | A string that will be prefixed to all cookies that Payload sets. |
| `csrf` | A whitelist array of URLs to allow Payload to accept cookies from. [More details](https://payloadcms.com/docs/authentication/cookies#csrf-attacks) |
| `defaultDepth` | If a user does not specify `depth` while requesting a resource, this depth will be used. [More details](https://payloadcms.com/docs/queries/depth) |
| `defaultMaxTextLength` | The maximum allowed string length to be permitted application-wide. Helps to prevent malicious public document creation. |
| `folders` | An optional object to configure global folder settings. [More details](https://payloadcms.com/docs/folders/overview) |
| `queryPresets` | An object that to configure Collection Query Presets. [More details](https://payloadcms.com/docs/query-presets/overview) |
| `maxDepth` | The maximum allowed depth to be permitted application-wide. This setting helps prevent against malicious queries. Defaults to `10`. [More details](https://payloadcms.com/docs/queries/depth) |
| `indexSortableFields` | Automatically index all sortable top-level fields in the database to improve sort performance and add database compatibility for Azure Cosmos and similar. |
| `upload` | Base Payload upload configuration. [More details](https://payloadcms.com/docs/upload/overview#payload-wide-upload-options) |
| `routes` | Control the routing structure that Payload binds itself to. [More details](https://payloadcms.com/docs/admin/overview#root-level-routes) |
| `email` | Configure the Email Adapter for Payload to use. [More details](https://payloadcms.com/docs/email/overview) |
| `onInit` | A function that is called immediately following startup that receives the Payload instance as its only argument. |
| `debug` | Enable to expose more detailed error information. |
| `telemetry` | Disable Payload telemetry by passing `false`. [More details](https://payloadcms.com/docs/configuration/overview#telemetry) |
| `hooks` | An array of Root Hooks. [More details](https://payloadcms.com/docs/hooks/overview) |
| `plugins` | An array of Plugins. [More details](https://payloadcms.com/docs/plugins/overview) |
| `endpoints` | An array of Custom Endpoints added to the Payload router. [More details](https://payloadcms.com/docs/rest-api/overview#custom-endpoints) |
| `custom` | Extension point for adding custom data (e.g. for plugins). |
| `i18n` | Internationalization configuration. Pass all i18n languages you'd like the admin UI to support. Defaults to English-only. [More details](https://payloadcms.com/docs/configuration/i18n) |
| `secret`* | A secure, unguessable string that Payload will use for any encryption workflows - for example, password salt / hashing. |
| `sharp` | If you would like Payload to offer cropping, focal point selection, and automatic media resizing, install and pass the Sharp module to the config here. |
| `typescript` | Configure TypeScript settings here. [More details](https://payloadcms.com/docs/configuration/overview#typescript) |

* An asterisk denotes that a property is required.

**Note:** Some properties are removed from the client-side bundle. [More details](https://payloadcms.com/docs/custom-components/overview#accessing-the-payload-config).

### TypeScript Config

Payload exposes a variety of TypeScript settings that you can leverage. These settings are used to auto-generate TypeScript interfaces for your [Collections](https://payloadcms.com/docs/configuration/collections) Collections and [Globals](https://payloadcms.com/docs/configuration/globals) Globals, and to ensure that Payload uses your [Generated Types](https://payloadcms.com/docs/typescript/overview) Generated Types for all [Local API](https://payloadcms.com/docs/local-api/overview) Local API methods.

To customize the TypeScript settings, use the `typescript` property in your Payload Config:

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  typescript: {
    // ...
  },
})
```

The following options are available:

| Option | Description |
|--------|-------------|
| `autoGenerate` | By default, Payload will auto-generate TypeScript interfaces for all collections and globals that your config defines. Opt out by setting `typescript.autoGenerate: false`. [More details](https://payloadcms.com/docs/typescript/overview) |
| `declare` | By default, Payload adds a `declare` block to your generated types, which makes sure that Payload uses your generated types for all Local API methods. Opt out by setting `typescript.declare: false`. |
| `outputFile` | Control the output path and filename of Payload's auto-generated types by defining the `typescript.outputFile` property to a full, absolute path. |

## Config Location

For Payload command-line scripts, we need to be able to locate your Payload Config. We'll check a variety of locations for the presence of `payload.config.ts` by default, including:

1. The root current working directory
2. The `compilerOptions` in your `tsconfig`*
3. The `dist` directory*

* Config location detection is different between development and production environments. See below for more details.

**Important:** Ensure your `tsconfig.json` is properly configured for Payload to auto-detect your config location. If it does not exist, or does not specify the proper `compilerOptions`, Payload will default to the current working directory.

### Development Mode

In development mode, if the configuration file is not found at the root, Payload will attempt to read your `tsconfig.json`, and attempt to find the config file specified in the `rootDir`:

```json
{
  // ...
  "compilerOptions": {
    "rootDir": "src"
  }
}
```

### Production Mode

In production mode, Payload will first attempt to find the config file in the `outDir` of your `tsconfig.json`, and if not found, will fallback to the `rootDir` directory:

```json
{
  // ...
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

If none was in either location, Payload will finally check the `dist` directory.

### Customizing the Config Location

In addition to the above automated detection, you can specify your own location for the Payload Config. This can be useful in situations where your config is not in a standard location, or you wish to switch between multiple configurations. To do this, Payload exposes an [Environment Variable](https://payloadcms.com/docs/configuration/environment-vars) Environment Variable to bypass all automatic config detection.

To use a custom config location, set the `PAYLOAD_CONFIG_PATH` environment variable:

```json
{
  "scripts": {
    "payload": "PAYLOAD_CONFIG_PATH=/path/to/custom-config.ts payload"
  }
}
```

**Tip:** `PAYLOAD_CONFIG_PATH` can be either an absolute path, or path relative to your current working directory.

## Telemetry

Payload collects completely anonymous telemetry data about general usage. This data is super important to us and helps us accurately understand how we're growing and what we can do to build the software into everything that it can possibly be. The telemetry that we collect also help us demonstrate our growth in an accurate manner, which helps us as we seek investment to build and scale our team. If we can accurately demonstrate our growth, we can more effectively continue to support Payload as free and open-source software.

To opt out of telemetry, you can pass `telemetry: false` within your Payload Config.

For more information about what we track, take a look at our [privacy policy](https://payloadcms.com/privacy).

## Cross-origin resource sharing (CORS)

Cross-origin resource sharing (CORS) can be configured with either a whitelist array of URLS to allow CORS requests from, a wildcard string (`*`) to accept incoming requests from any domain, or an object with the following properties:

| Option | Description |
|--------|-------------|
| `origins` | Either a whitelist array of URLS to allow CORS requests from, or a wildcard string (`'*'`) to accept incoming requests from any domain. |
| `headers` | A list of allowed headers that will be appended in `Access-Control-Allow-Headers`. |

Here's an example showing how to allow incoming requests from any domain:

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  cors: '*',
})
```

Here's an example showing how to append a new header (`x-custom-header`) in `Access-Control-Allow-Headers`:

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  cors: {
    origins: ['http://localhost:3000'],
    headers: ['x-custom-header'],
  },
})
```

## TypeScript

You can import types from Payload to help make writing your config easier and type-safe. There are two main types that represent the Payload Config, `Config` and `SanitizedConfig`.

The `Config` type represents a raw Payload Config in its full form. Only the bare minimum properties are marked as required. The `SanitizedConfig` type represents a Payload Config after it has been fully sanitized. Generally, this is only used internally by Payload.

```typescript
import type { Config, SanitizedConfig } from 'payload'
```

## Server vs. Client

The Payload Config only lives on the server and is not allowed to contain any client-side code. That way, you can load up the Payload Config in any server environment or standalone script, without having to use Bundlers or Node.js loaders to handle importing client-only modules (e.g. scss files or React Components) without any errors.

Behind the curtains, the Next.js-based Admin Panel generates a ClientConfig, which strips away any server-only code and enriches the config with React Components.

## Compatibility flags

The Payload Config can accept compatibility flags for running the newest versions but with older databases. You should only use these flags if you need to, and should confirm that you need to prior to enabling these flags.

### allowLocalizedWithinLocalized

Payload localization works on a field-by-field basis. As you can nest fields within other fields, you could potentially nest a localized field within a localized field—but this would be redundant and unnecessary. There would be no reason to define a localized field within a localized parent field, given that the entire data structure from the parent field onward would be localized.

By default, Payload will remove the `localized: true` property from sub-fields if a parent field is localized. Set this compatibility flag to `true` only if you have an existing Payload MongoDB database from pre-3.0, and you have nested localized fields that you would like to maintain without migrating.

## Custom bin scripts

Using the `bin` configuration property, you can inject your own scripts to `npx payload`. Example for `pnpm payload seed`:

**Step 1:** create `seed.ts` file in the same folder with `payload.config.ts` with:

```typescript
import type { SanitizedConfig } from 'payload'

import payload from 'payload'

// Script must define a "script" function export that accepts the sanitized config
export const script = async (config: SanitizedConfig) => {
  await payload.init({ config })
  await payload.create({
    collection: 'pages',
    data: { title: 'my title' },
  })
  payload.logger.info('Successfully seeded!')
  process.exit(0)
}
```

**Step 2:** add the `seed` script to `bin`:

```typescript
export default buildConfig({
  bin: [
    {
      scriptPath: path.resolve(dirname, 'seed.ts'),
      key: 'seed',
    },
  ],
})
```

Now you can run the command using:

```bash
pnpm payload seed
```

## Running bin scripts on a schedule

Every bin script supports being run on a schedule using cron syntax. Simply pass the `--cron` flag followed by the cron expression when running the script. Example:

```bash
pnpm payload run ./myScript.ts --cron "0 * * * *"
```

This will use the `run` bin script to execute the specified script on the defined schedule.

[Next: Collection Configs](https://payloadcms.com/docs/configuration/collections)