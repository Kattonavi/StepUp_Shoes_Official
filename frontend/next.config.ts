import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',

  // Imágenes — dominios permitidos (ampliar en fases posteriores)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
