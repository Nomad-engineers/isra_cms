import type { CollectionConfig } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: {
    useAsTitle: 'name',
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
      name: 'user',
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
