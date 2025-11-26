import { AccessHelper } from '@/helper/access.helper'
import type { CollectionConfig } from 'payload'
import { googleEndpoint } from './endpoints/google.endpoint'
import { registerEndpoint } from './endpoints'

export enum UserRole {
  admin = 'admin',
  client = 'client',
  moderator = 'moderator',
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    useSessions: false,
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => AccessHelper.isAdmin(user),
    delete: ({ req: { user } }) => AccessHelper.isAdmin(user),
    update: ({ req: { user }, id }) => user?.id === id || AccessHelper.isAdmin(user),
  },
  fields: [
    {
      name: 'avatar',
      label: 'Аватар',
      type: 'upload',
      relationTo: 'user-avatar',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
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
      method: 'get',
      handler: googleEndpoint,
    },
  ],
  timestamps: true,
}
