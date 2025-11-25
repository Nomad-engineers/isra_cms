import { User } from '@/payload-types'
import payload, { Field } from 'payload'
import { fieldAffectsData, fieldHasSubFields } from 'payload/shared'
import jwt from 'jsonwebtoken'

export const loginWithEmail = async (email: string) => {
  const user: User = (
    await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      depth: 0,
      limit: 1,
    })
  ).docs[0]

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

  // Set cookie
  // return Response.(`${payload.config.cookiePrefix}-token`, token, {
  //   path: '/',
  //   httpOnly: true,
  //   expires: collectionConfig.auth.tokenExpiration,
  //   secure: collectionConfig.auth.cookies.secure,
  //   sameSite: collectionConfig.auth.cookies.sameSite,
  //   domain: collectionConfig.auth.cookies.domain || undefined,
  // })
}
