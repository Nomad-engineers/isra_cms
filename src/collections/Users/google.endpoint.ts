import { Field, PayloadRequest } from 'payload'
import { User } from '@/payload-types'
import { fieldAffectsData, fieldHasSubFields } from 'payload/shared'
import jwt from 'jsonwebtoken'

export const googleEndpoint = async (req: PayloadRequest) => {
  if (req.json == null) return Response.json({ error: 'Invalid request' }, { status: 400 })

  try {
    const { payload } = req

    const code = req.query.code as string
    if (!code) return Response.json({ error: 'Missing code' }, { status: 400 })

    // 1. Обмениваем code → токены Google
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()

    // 2. Получаем данные пользователя через id_token
    const payloadBase64 = tokens.id_token.split('.')[1]
    const googleUser = JSON.parse(Buffer.from(payloadBase64, 'base64').toString())
    const email = googleUser.email

    // 3. Ищем пользователя в Payload
    let user: User = (
      await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
      })
    ).docs[0]

    // 4. Создаем если нет
    if (!user) {
      user = await payload.create({
        collection: 'users',
        data: {
          email,
          firstName: googleUser.name,
        },
      })
    }

    // 6. Создаем Payload JWT (как при login email/password)
    // const loginResult = await payload.login({
    //   collection: 'users',
    //   data: {
    //     email: user.email,
    //   },
    // })

    // return Response.redirect(
    //   process.env.GOOGLE_SUCCESS_REDIRECT! + `?token=${loginResult.token}&email=${email}`,
    // )

    // const user: User = (
    //   await payload.find({
    //     collection: 'users',
    //     where: {
    //       email: {
    //         equals: email,
    //       },
    //     },
    //     depth: 0,
    //     limit: 1,
    //   })
    // ).docs[0]

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

    return Response.json(
      {},
      {
        status: 200,
        headers: {
          'Set-Cookie': `${payload.config.cookiePrefix}-token=${token}; Path=/; HttpOnly; ${
            collectionConfig.auth.tokenExpiration
              ? `Expires=${new Date(
                  Date.now() + collectionConfig.auth.tokenExpiration * 1000,
                ).toUTCString()};`
              : ''
          } ${collectionConfig.auth.cookies.secure ? 'Secure;' : ''} SameSite=${
            collectionConfig.auth.cookies.sameSite
          }; ${collectionConfig.auth.cookies.domain ? `Domain=${collectionConfig.auth.cookies.domain};` : ''}`,
        },
      },
    )
  } catch (error) {
    return Response.json({ message: 'Internal server error', error })
  }
}
