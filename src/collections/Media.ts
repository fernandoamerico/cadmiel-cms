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
    // Usa a URL original como miniatura na administração para garantir que o preview apareça
    // mesmo que o processamento de tamanhos falhe ou não seja configurado.
    adminThumbnail: ({ doc }) => {
      const url = doc.url as string
      if (url && url.startsWith('http')) return url
      return `/media/${doc.filename}`
    },
  },
  access: {
    read: () => true, // publicly readable
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['thumbnail', 'filename', 'alt', 'updatedAt'],
    components: {
      beforeListTable: ['../components/GalleryView'],
    },
  },
  fields: [
    {
      name: 'thumbnail',
      type: 'ui',
      admin: {
        components: {
          Cell: '../components/MediaThumbnailCell',
        },
      },
    },
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
