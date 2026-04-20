export async function triggerRevalidation(slug?: string) {
  const MAIN_SITE_URL = process.env.MAIN_SITE_URL || ''
  const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN || ''

  if (!MAIN_SITE_URL || !REVALIDATE_TOKEN) {
    console.warn('[CMS] Missing MAIN_SITE_URL or REVALIDATE_TOKEN for revalidation')
    return
  }

  try {
    const url = `${MAIN_SITE_URL}/api/revalidate`
    console.log(`[CMS] Triggering revalidation at ${url} for slug: ${slug || 'all'}`)
    
    await fetch(url, {
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
