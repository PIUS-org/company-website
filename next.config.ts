import type { NextConfig } from 'next';

/* PIUS_PREVIEW=1 is used only to build the static preview page inside Claude.
   PIUS_EXPORT=1 is used only by `npm run portfolio:export` (local PDF output).
   Neither is ever set on the real server, so production behaviour is unchanged. */
const preview = process.env.PIUS_PREVIEW === '1';
const exportBuild = process.env.PIUS_EXPORT === '1';

const nextConfig: NextConfig = {
  /* The animation controllers create DOM nodes imperatively (graphs, mock screens, particles).
     StrictMode's development-only double mount would duplicate them, so it is off.
     Production behaviour is unaffected either way. */
  reactStrictMode: false,
  ...(preview ? { output: 'export' as const, distDir: '.preview-build', assetPrefix: '.', images: { unoptimized: true }, env: { NEXT_PUBLIC_PIUS_PREVIEW: '1' } } : {}),
  ...(exportBuild ? { output: 'export' as const, distDir: '.export-build', images: { unoptimized: true } } : {}),
};

export default nextConfig;
