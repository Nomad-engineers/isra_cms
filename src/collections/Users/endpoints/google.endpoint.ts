import { Field, PayloadRequest } from 'payload'
import { User } from '@/payload-types'
import { fieldAffectsData, fieldHasSubFields } from 'payload/shared'
import jwt from 'jsonwebtoken'

export const googleEndpoint = async (req: PayloadRequest) => {
  try {
    const idToken = await req.query.idToken
    if (!idToken) return Response.json({ error: 'Missing idToken' }, { status: 400 })
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, {
      method: 'GET',
    })
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
}
