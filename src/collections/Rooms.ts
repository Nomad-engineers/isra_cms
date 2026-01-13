import { AccessHelper } from '@/helper/access.helper'
import { Room, User } from '@/payload-types'
import type { CollectionConfig, PayloadRequest } from 'payload'
import { v4 as uuidv4 } from 'uuid'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => AccessHelper.isAdmin(user),
    delete: async ({ req: { user, payload }, id }) => {
      if (!user || !id) return false
      if (AccessHelper.isAdmin(user)) return true
      try {
        const room = await payload.findByID({
          collection: 'rooms',
          id,
        })
        return (room.user as User).id == user.id
      } catch (e) {
        return false
      }
    },
    update: async ({ req, id }) => {
      const { user, payload } = req
      if (!user || !id) return false
      if (AccessHelper.isAdmin(user)) return true
      try {
        const room = await payload.findByID({
          collection: 'rooms',
          id,
        })
        return (room.user as User).id == user.id
      } catch (e) {
        return false
      }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.id) {
          const customID = uuidv4()
          return { ...data, id: customID }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'id',
      type: 'text',
    },
    {
      name: 'logo',
      type: 'relationship',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'speaker',
      label: 'Имя спикера',
      type: 'text',
      required: true,
    },
    {
      name: 'user',
      label: 'Пользователь',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Live',
          value: 'live',
        },
        {
          label: 'Auto',
          value: 'auto',
        },
      ],
      defaultValue: 'live',
    },
    {
      name: 'scheduledDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      required: false,
      hooks: {
        afterChange: [
          async ({ req, originalDoc, value, previousValue }) => {
            if (value == previousValue) return
            const room = originalDoc as Room
            if (!room.scheduledDate) return

            await req.payload.jobs.queue({
              task: 'runRoom',
              input: { roomId: room.id },
              overrideAccess: true,
              waitUntil: new Date(room.scheduledDate),
            })
          },
        ],
      },
    },
    {
      name: 'roomStarted',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: false,
    },
    {
      name: 'bannerUrl',
      type: 'text',
      required: false,
    },
    {
      name: 'showBanner',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'btnUrl',
      type: 'text',
      required: false,
    },
    {
      name: 'showBtn',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showChat',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'isVolumeOn',
      type: 'checkbox',
      defaultValue: true,
    },
    {
  name: 'welcomeMessage',
  type: 'textarea',
  admin: {
        description: 'Это сообщение будет автоматически показано участникам при подключении к чату',
       
      },
  
  required: false,
},
    {
      name: 'startedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      required: false,
    },
    {
      name: 'stoppedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      required: false,
    },
    {
      name: 'description',
      type: 'text',
      required: false,
    },
  ],
  endpoints: [
    {
      path: '/my',
      method: 'get',
      handler: async (req) => {
        const user = req.user
        console.log('user', user)
        if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 })

        const result = await req.payload.find({
          collection: 'rooms',
          where: {
            user: { equals: user.id },
          },
        })
        return Response.json(result)
      },
    },
    {
      path: '/create',
      method: 'post',
      handler: async (req) => {
        const user = req.user
        if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 })

        try {
          const data = await req.json!()
          const result = await req.payload.create({
            collection: 'rooms',
            data: {
              ...data,
              user: user.id,
            },
          })
          return Response.json(result)
        } catch (e) {
          return Response.json({ message: 'Internal server error', e })
        }
      },
    },
    {
      path: '/start/:id',
      method: 'post',
      handler: async (req) => {
        const user = req.user
        if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 })

        try {
          const id = (await req.routeParams!.id!) as string
          const room = await req.payload.findByID({
            collection: 'rooms',
            id,
          })
          await req.payload.jobs.queue({
            task: 'runRoom',
            input: { roomId: room.id },
            overrideAccess: true,
          })

          return Response.json({ success: true })
        } catch (e) {
          return Response.json({ message: 'Internal server error', e })
        }
      },
    },
  ],
}
