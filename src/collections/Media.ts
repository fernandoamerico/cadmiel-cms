import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Mídia',
    plural: 'Mídias',
  },
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    mimeTypes: ['image/*'],
    // adminThumbnail uses originalDoc (pre-hook), so we derive the URL in
    // the collection afterRead hook below instead.
    adminThumbnail: ({ doc }) => doc.url as string,
  },
  hooks: {
    // Fix thumbnailURL: Payload computes it from originalDoc.url (the raw DB
    // value) before the cloud-storage plugin transforms url to the Blob CDN URL.
    // Running here, after all field hooks, doc.url is already the Blob URL.
    afterRead: [
      ({ doc }) => {
        if (doc.url) doc.thumbnailURL = doc.url
        return doc
      },
    ],
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
      beforeListTable: ['@/components/GalleryView#GalleryView'],
    },
  },
  fields: [
    {
      name: 'thumbnail',
      type: 'ui',
      admin: {
        components: {
          Cell: '@/components/MediaThumbnailCell#MediaThumbnailCell',
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
