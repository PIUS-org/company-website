import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* The animation controllers create DOM nodes imperatively (graphs, mock screens, particles).
     StrictMode's development-only double mount would duplicate them, so it is off.
     Production behaviour is unaffected either way. */
  reactStrictMode: false,
};

export default nextConfig;
