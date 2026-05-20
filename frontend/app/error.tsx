'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Algo salió mal</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Ocurrió un error inesperado. Por favor intenta de nuevo.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="border border-border font-semibold px-6 py-3 rounded-lg hover:bg-muted transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
