import google from 'next-auth/providers/google'
import { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  providers: [google],
}
