// storage-adapter-import-placeholder
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { Media, Plans, Rooms, UserAvatar, Users } from './collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  cors: {
    origins: '*',
    headers: ['Authorization', 'Content-Type'],
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  collections: [Users, Media, Rooms, UserAvatar, Plans],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: true, // Optional, defaults to true
      collections: {
        media: true,
        'user-avatar': true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  email: nodemailerAdapter({
    defaultFromAddress: 'isra@isra.kz',
    defaultFromName: 'ISRA Support',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  jobs: {
    jobsCollectionOverrides: ({ defaultJobsCollection }) => {
      if (!defaultJobsCollection.admin) {
        defaultJobsCollection.admin = {}
      }

      defaultJobsCollection.admin.hidden = false
      return defaultJobsCollection
    },
    autoRun: [
      {
        cron: '* * * * *',
        queue: 'default',
        limit: 100,
      },
    ],
    tasks: [
      {
        schedule: [],
        slug: 'runRoom',
        inputSchema: [
          {
            name: 'roomId',
            type: 'number',
            required: true,
          },
        ],
        retries: 1,
        handler: async ({ input, job, req }) => {
          const result = await req.payload.update({
            collection: 'rooms',
            id: input.roomId,
            data: {
              roomStarted: true,
              startedAt: new Date().toUTCString(),
            },
          })
          return {
            output: true,
          }
        },
      },
    ],
  },
})
