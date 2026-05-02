/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the app can be hosted as a flat bucket of files.
  // Everything is client-side anyway (no API routes, no server actions).
  output: process.env.NEXT_OUTPUT_EXPORT === '1' ? 'export' : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
