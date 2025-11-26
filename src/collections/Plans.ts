import { AccessHelper } from '@/helper/access.helper'
import { CollectionConfig } from 'payload'

export const Plans: CollectionConfig = {
  slug: 'plans',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => AccessHelper.isAdmin(user),
    update: ({ req: { user } }) => AccessHelper.isAdmin(user),
    delete: ({ req: { user } }) => AccessHelper.isAdmin(user),
  },
  fields: [
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'code',
      type: 'text',
      unique: true,
      required: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'monthlyPrice',
      type: 'number',
      required: true,
    },
    {
      name: 'yearlyPrice',
      type: 'number',
    },
    {
      name: 'features',
      type: 'array',
      minRows: 1,
      maxRows: 20,
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
}
