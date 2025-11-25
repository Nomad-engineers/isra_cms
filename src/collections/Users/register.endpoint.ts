import { PayloadRequest } from 'payload'
import { UserRole } from '.'

export const registerEndpoint = async (req: PayloadRequest) => {
  if (req.json == null) return Response.json({ error: 'Invalid request' }, { status: 400 })

  try {
    const data = await req.json()

    const result = await req.payload.create({
      collection: 'users',
      data: {
        ...data,
        role: UserRole.client,
      },
    })
    return Response.json(result)
  } catch (error) {
    return Response.json({ message: 'Internal server error', error })
  }
}
