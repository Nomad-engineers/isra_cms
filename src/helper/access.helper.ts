import { UserRole } from '@/collections/Users'
import { User } from '@/payload-types'

export class AccessHelper {
  static isAdmin(user: User | null): boolean {
    return user?.role?.includes(UserRole.admin) || false
  }
}
