import type { NextConfig } from 'next';

/* eslint-disable @typescript-eslint/no-explicit-any */
const nextConfig: NextConfig = {
  experimental: {
    turbopack: {
      root: __dirname,
    },
  } as any,
};

export default nextConfig;