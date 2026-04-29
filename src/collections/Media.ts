import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true, // publicly readable
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  admin: {
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false, // Alterado para false para evitar problemas com mídias migradas sem alt
      label: 'Texto alternativo (acessibilidade)',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Legenda',
    },
  ],
}
