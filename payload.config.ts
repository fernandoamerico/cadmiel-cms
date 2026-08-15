import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, EXPERIMENTAL_TableFeature } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { pt } from '@payloadcms/translations/languages/pt'
import { en } from '@payloadcms/translations/languages/en'
import sharp from 'sharp'

import { Users } from './src/collections/Users'
import { Posts } from './src/collections/Posts'
import { Media } from './src/collections/Media'
import { Projects } from './src/collections/Projects'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const MAIN_SITE_URL = process.env.MAIN_SITE_URL || ''

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
    },
    meta: {
      titleSuffix: '— Cadmiel CMS',
    },


    theme: 'dark',
  },

  i18n: {
    fallbackLanguage: 'pt',
    supportedLanguages: { pt, en },
  },

  // Allow the main site to call the Payload REST API cross-origin
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
    'https://cadmielconstrutora.com',
    'https://www.cadmielconstrutora.com',
    'https://cadmiel-cms.vercel.app', // Fallback URL da Vercel
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean),

  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
    'https://cadmielconstrutora.com',
    'https://www.cadmielconstrutora.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean),

  collections: [Users, Posts, Media, Projects],

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
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    },
    push: false,
  }),

  plugins: [
    // Use S3 plugin for Cloudflare R2 when credentials are present
    ...(process.env.S3_ACCESS_KEY_ID
      ? [
          s3Storage({
            collections: {
              media: {
                disablePayloadAccessControl: true,
              },
            },
            bucket: process.env.S3_BUCKET || '',
            config: {
              endpoint: process.env.S3_ENDPOINT || '',
              region: 'auto',
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
            },
          }),
        ]
      : []),
  ],

  sharp,
})
