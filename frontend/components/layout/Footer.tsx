import Link from 'next/link'
import { Zap, MessageCircle, Instagram, Facebook } from 'lucide-react'
import type { PublicStoreSettings } from '@/types'

interface FooterProps {
  waNumber?: string | null
  settings?: PublicStoreSettings | null
}

export default function Footer({ waNumber, settings }: FooterProps) {
  const year = new Date().getFullYear()
  const effectiveWa = waNumber ?? process.env.NEXT_PUBLIC_WA_NUMBER ?? null
  const storeName = settings?.storeName ?? 'Nómada'
  const storeSlogan = settings?.storeSlogan ?? 'Zapatos, gorras, ropa y accesorios para tu estilo.'

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
              {storeName}
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              {storeSlogan}
            </p>
            {/* Social icons */}
            {(settings?.instagramUrl || settings?.facebookUrl) && (
              <div className="flex items-center gap-3 mt-4">
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Tienda
            </p>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-foreground hover:text-primary transition-colors">Inicio</Link>
              <Link href="/catalogo" className="text-sm text-foreground hover:text-primary transition-colors">Catálogo</Link>
              <Link href="/catalogo?isNew=true" className="text-sm text-foreground hover:text-primary transition-colors">Nuevos ingresos</Link>
              <Link href="/catalogo?isOnSale=true" className="text-sm text-foreground hover:text-primary transition-colors">Ofertas</Link>
              <Link href="/contacto" className="text-sm text-foreground hover:text-primary transition-colors">Contacto</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Contacto
            </p>
            <div className="space-y-2">
              {effectiveWa ? (
                <a
                  href={`https://wa.me/${effectiveWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Escríbenos por WhatsApp
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Contacto vía formulario</p>
              )}
              {settings?.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {settings.contactEmail}
                </a>
              )}
              {settings?.city && settings?.country && (
                <p className="text-sm text-muted-foreground">{settings.city}, {settings.country}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {year} {storeName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
