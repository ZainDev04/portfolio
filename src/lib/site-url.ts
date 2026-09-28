// Absolute site URL for metadata, sitemap and robots. Set NEXT_PUBLIC_SITE_URL
// once a custom domain exists; on Vercel it falls back to the production URL.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
