import { AccessHelper } from '@/helper/access.helper'
import type { CollectionConfig, Field, PayloadRequest } from 'payload'
import { registerEndpoint } from './register.endpoint'
import { google } from 'googleapis'
import { User } from '@/payload-types'
import { fieldAffectsData, fieldHasSubFields } from 'payload/shared'
import jwt from 'jsonwebtoken'

export enum UserRole {
  admin = 'admin',
  client = 'client',
  moderator = 'moderator',
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: {
    useSessions: false,
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => AccessHelper.isAdmin(user),
    delete: ({ req: { user } }) => AccessHelper.isAdmin(user),
    update: ({ req: { user }, id }) => {
      return user?.id === id || AccessHelper.isAdmin(user)
    },

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
      method: 'get',
      handler: async (req: PayloadRequest) => {
        try {
          const idToken = await req.query.idToken
          if (!idToken) return Response.json({ error: 'Missing idToken' }, { status: 400 })
          const response = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
            {
              method: 'GET',
            },
          )
          const dataGoogle = await response.json()
          const email = dataGoogle.email
          if (!email) return Response.json({ error: 'Email not found in token' }, { status: 400 })
          const { payload } = req

          let user: User = (
            await payload.find({
              collection: 'users',
              where: { email: { equals: email } },
            })
          ).docs[0]
          if (!user) {
            user = await payload.create({
              collection: 'users',
              data: {
                email,
                firstName: dataGoogle.given_name,
                lastName: dataGoogle.family_name,
                password: Math.random().toString(36).slice(-8),
              },
            })
          }
          const collectionConfig = payload.collections['users'].config

          const fieldsToSign = collectionConfig.fields.reduce(
            (signedFields, field: Field) => {
              const result = {
                ...signedFields,
              }

              if (!fieldAffectsData(field) && fieldHasSubFields(field)) {
                field.fields.forEach((subField) => {
                  if (fieldAffectsData(subField) && subField.saveToJWT) {
                    result[subField.name] = user[subField.name as keyof User]
                  }
                })
              }

              if (fieldAffectsData(field) && field.saveToJWT) {
                result[field.name] = user[field.name as keyof User]
              }

              return result
            },
            {
              email: user.email,
              id: user.id,
              collection: collectionConfig.slug,
            } as any,
          )

          // Sign the JWT
          const token = jwt.sign(fieldsToSign, payload.secret, {
            expiresIn: collectionConfig.auth.tokenExpiration,
          })

          return Response.json({ token })
        } catch (e) {
          return Response.json({ error: 'Invalid request', e }, { status: 500 })
        }
      },
    },
  ],
  timestamps: true,
}
