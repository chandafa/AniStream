import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sankavollerei.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'otakudesu.best',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'anichin.cafe',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
