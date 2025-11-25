import { AccessHelper } from '@/helper/access.helper'
import type { CollectionConfig } from 'payload'
import { registerEndpoint } from './register.endpoint'
import { googleEndpoint } from './google.endpoint'

export enum UserRole {
  admin = 'admin',
  client = 'client',
  moderator = 'moderator',
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: true,
  access: {
    read: () => true,
    create: ({ req: { user } }) => AccessHelper.isAdmin(user),
    delete: ({ req: { user } }) => AccessHelper.isAdmin(user),
    update: ({ req: { user }, id }) => user?.id === id,

    // admin: ({ req: { user } }) => false,
  },
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Фамилия',
      type: 'text',
    },
    {
      name: 'firstName',
      label: 'Имя',
      type: 'text',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        {
          label: 'Админ',
          value: UserRole.admin,
        },
        {
          label: 'Клиент',
          value: UserRole.client,
        },
        {
          label: 'Модератор',
          value: UserRole.moderator,
        },
      ],
      defaultValue: UserRole.client,
      access: {
        update: ({ req: { user } }) => AccessHelper.isAdmin(user),
      },
    },
    {
      name: 'phone',
      label: 'Телефон',
      type: 'text',
      validate: (value: any) => {
        if (value && !/^\+?[1-9]\d{1,14}$/.test(value)) {
          return 'Invalid phone number format'
        }
        return true
      },
    },
    {
      name: 'isPhoneVerified',
      label: 'Подтвержден ли телефон',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  endpoints: [
    {
      path: '/register',
      method: 'post',
      handler: registerEndpoint,
    },
    {
      path: '/google',
      method: 'post',
      handler: googleEndpoint,
    },
  ],
  timestamps: true,
}
