/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'firebase', '@google/genai'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config, { dev, isServer }) => {
    // Increase chunk load timeout to 5 minutes so dev server never times out prematurely on Windows/OneDrive
    config.output = {
      ...config.output,
      chunkLoadTimeout: 300000,
    };

    if (dev) {
      // Use in-memory caching to eliminate OneDrive disk file-locking
      // and prevent ChunkLoadError caused by cache misses or missing chunks
      config.cache = {
        type: 'memory',
      };

      // Prevent Webpack from polling/watching internal build output and VCS
      config.watchOptions = {
        poll: false,
        followSymlinks: false,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
    }
    return config;
  },
};

export default nextConfig;
