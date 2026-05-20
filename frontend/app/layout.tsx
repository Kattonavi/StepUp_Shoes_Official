import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'StepUp — Zapatos, Gorras y Accesorios',
    template: '%s | StepUp',
  },
  description:
    'Catálogo de zapatos, gorras, ropa y accesorios. Encuentra tu estilo en StepUp.',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'StepUp',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(240 5% 13%)',
              color: 'hsl(43 35% 94%)',
              border: '1px solid hsl(240 7% 18%)',
            },
          }}
        />
      </body>
    </html>
  )
}
