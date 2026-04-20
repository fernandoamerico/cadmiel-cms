import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The CMS has no public-facing pages, only the admin panel
}

export default withPayload(nextConfig)
