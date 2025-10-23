import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    domains: ['pub-a6698d33e75a45ebb75c9b00d0c3ce2a.r2.dev'],
  },
};

export default nextConfig;
