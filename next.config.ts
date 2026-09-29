import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project. Without it, Turbopack infers the
    // root from the nearest lockfile upward and picks up a stray
    // ~/package-lock.json outside any repo, which produces a misleading
    // "detected additional lockfiles" warning on every `next dev`.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;