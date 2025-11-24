import { User } from '@/payload-types'
import type { CollectionConfig, PayloadRequest } from 'payload'
import { password } from 'payload/shared'

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
    read: (): boolean => true,
    create: (): boolean => false,
    delete: (): boolean => false,
    update: (): boolean => false,
  },
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      name: 'last_name',
      label: 'Фамилия',
      type: 'text',
    },
    {
      name: 'first_name',
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
    },
  ],

  endpoints: [
    {
      path: '/register',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        try {
          const data = await req.json!()

          await req.payload.create({
            collection: 'users',
            data: {
              ...data,
              role: UserRole.client,
            },
          })
          return Response.json({
            message: 'Created',
          })
        } catch (error) {
          return Response.json({ message: 'Internal server error', error })
        }
      },
    },
  ],
  timestamps: true,
}
