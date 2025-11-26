import { CollectionConfig } from 'payload'

export const UserAvatar: CollectionConfig = {
  slug: 'user-avatar',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [],
  upload: true,
}
