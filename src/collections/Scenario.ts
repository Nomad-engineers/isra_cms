import { CollectionConfig } from 'payload'
import { v4 } from 'uuid'

export const Scenario: CollectionConfig = {
  slug: 'scenario',
  admin: {},
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.id) {
          const customID = v4()
          return { ...data, id: customID }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'id',
      type: 'text',
    },
    {
      name: 'username',
      type: 'text',
    },
    {
      name: 'message',
      type: 'text',
    },
    {
      name: 'seconds',
      type: 'number',
    },
    {
      name: 'room',
      type: 'relationship',
      relationTo: 'rooms',
    },
  ],
}
