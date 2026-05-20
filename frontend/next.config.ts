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

  // Variables de entorno expuestas al cliente
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  },
}

export default nextConfig
