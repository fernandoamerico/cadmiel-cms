import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, EXPERIMENTAL_TableFeature } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { pt } from '@payloadcms/translations/languages/pt'
import { en } from '@payloadcms/translations/languages/en'
import sharp from 'sharp'

import { Users } from './src/collections/Users'
import { Posts } from './src/collections/Posts'
import { Media } from './src/collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const MAIN_SITE_URL = process.env.MAIN_SITE_URL || ''
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN || ''

async function triggerRevalidation(slug?: string) {
  if (!MAIN_SITE_URL || !REVALIDATE_TOKEN) return
  try {
    await fetch(`${MAIN_SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REVALIDATE_TOKEN}`,
      },
      body: JSON.stringify({ slug }),
    })
  } catch (err) {
    console.error('[CMS] Failed to trigger revalidation:', err)
  }
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
    },
    meta: {
      titleSuffix: '— Cadmiel CMS',
    },
  },

  i18n: {
    supportedLanguages: { pt, en },
  },

  // Allow the main site to call the Payload REST API cross-origin
  cors: [
    MAIN_SITE_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean),

  csrf: [
    MAIN_SITE_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean),

  collections: [Users, Posts, Media],

  editor: lexicalEditor({ features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()] }),

  secret: process.env.PAYLOAD_SECRET || (() => {
    throw new Error('PAYLOAD_SECRET env var is required')
  })(),

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || (() => {
        throw new Error('DATABASE_URI env var is required')
      })(),
    },
    push: false,
  }),

  plugins: [
    // Only enable Vercel Blob when the token is present (production).
    // In local dev, uploads are stored on disk automatically.
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            enabled: true,
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],

  sharp,

  hooks: {
    afterOperation: [
      async ({ operation, collection, result }) => {
        // Revalidate main site cache when posts are created/updated/deleted
        if (collection?.slug === 'posts' && ['create', 'update', 'delete'].includes(operation)) {
          const slug = (result as { slug?: string })?.slug
          await triggerRevalidation(slug)
        }
      },
    ],
  },
})
