import { AccessHelper } from '@/helper/access.helper'
import { User } from '@/payload-types'
import type { CollectionConfig, PayloadRequest } from 'payload'

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
      try {
        const room = await payload.findByID({
          id: Number(id),
          collection: 'rooms',
        })
        return (room.user as User).id == user.id || AccessHelper.isAdmin(user)
      } catch (e) {
        return false
      }
    },
    update: async ({ req: { user, payload }, id }) => {
      if (!user || !id) return false
      try {
        const room = await payload.findByID({
          id: Number(id),
          collection: 'rooms',
        })
        return (room.user as User).id == user.id || AccessHelper.isAdmin(user)
      } catch (e) {
        return false
      }
    },
  },
  fields: [
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
      name: 'banUsers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
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
  ],
}
