// storage-adapter-import-placeholder
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { Media, Plans, Rooms, UserAvatar, Users } from './collections'
import { Scenario } from './collections/Scenario'
import { migrations } from './migrations'
import { C } from 'vitest/dist/chunks/reporters.d.DL9pg5DB.js'

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
  collections: [Users, Media, Rooms, UserAvatar, Plans, Scenario],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    push: false,
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true,
        'user-avatar': true,
      },
      bucket: process.env.MINIO_BUCKET || '',
      config: {
        endpoint: process.env.MINIO_ENDPOINT,
        region: 'eu-central-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY || '',
          secretAccessKey: process.env.MINIO_SECRET_KEY || '',
        },
      },
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
        cron: '* * * * * *',
        queue: 'default',
        limit: 100,
      },
    ],
    tasks: [
      {
        slug: 'runRoom',
        inputSchema: [
          {
            name: 'roomId',
            type: 'text',
            required: true,
          },
        ],
        retries: 1,
        handler: async ({ input, job, req }) => {
          const startedAt = new Date().toUTCString()
          const room = await req.payload.update({
            collection: 'rooms',
            id: input.roomId,
            data: {
              roomStarted: true,
              startedAt,
            },
          })

          let hasNextPage = true
          let page = 1

          await fetch(`https://socket.nomad-engineers.space/webinars/${room.id}/token?email=`)
          const startTime = new Date(startedAt).getTime()
          while (hasNextPage) {
            const scenario = await req.payload.find({
              collection: 'scenario',
              where: {
                room: {
                  equals: room.id,
                },
              },
              limit: 100,
              page,
            })

            for (let i = 0; i < scenario.docs.length; i++) {
              const { username, message, seconds } = scenario.docs[i]
              const delay = +(seconds ?? 0)

              const currentTime = Date.now()
              const targetTime = startTime + delay * 1000
              const delaySeconds = targetTime - currentTime
              if (delaySeconds > 0) {
                setTimeout(async () => {
                  await fetch(
                    `https://socket.nomad-engineers.space/chat/${room.id}/messages/scenario`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: '',
                        username,
                        message,
                      }),
                    },
                  )
                }, delaySeconds)
              } else {
                await fetch(
                  `https://socket.nomad-engineers.space/chat/${room.id}/messages/scenario`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: '',
                      username,
                      message,
                    }),
                  },
                )
              }
            }

            hasNextPage = scenario.hasNextPage
            page++
          }

          return {
            output: true,
          }
        },
      },
    ],
  },
})
