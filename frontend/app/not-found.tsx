import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-bold text-muted-foreground mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Lo que buscas no existe o fue movido. Vuelve al inicio para continuar explorando.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
      >
        Ir al inicio
      </Link>
    </div>
  )
}
