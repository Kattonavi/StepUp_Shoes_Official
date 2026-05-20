import Link from 'next/link'
import { Zap, MessageCircle } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-foreground hover:text-primary transition-colors"
            >
              <Zap className="w-4 h-4 text-primary" />
              StepUp
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Zapatos, gorras, ropa y accesorios para tu estilo.
              Calidad y diseño en cada paso.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Tienda
            </p>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                Inicio
              </Link>
              <Link
                href="/catalogo"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                Catálogo
              </Link>
              <Link
                href="/catalogo?isNew=true"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                Nuevos ingresos
              </Link>
              <Link
                href="/catalogo?isOnSale=true"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                Ofertas
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Contacto
            </p>
            {waNumber ? (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Escríbenos por WhatsApp
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                Contacto próximamente
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {year} StepUp. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
