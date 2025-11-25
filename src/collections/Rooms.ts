import { AccessHelper } from '@/helper/access.helper'
import type { CollectionConfig, PayloadRequest } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: (): boolean => true,
    create: (): boolean => true,
    delete: (): boolean => true,
    update: (): boolean => true,
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
  ],
}
