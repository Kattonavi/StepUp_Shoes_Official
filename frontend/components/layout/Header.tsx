'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Zap, MessageCircle } from 'lucide-react'
import { GENERAL_WA_MESSAGE, buildWhatsAppUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <Zap className="w-5 h-5 text-primary" />
          StepUp
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {process.env.NEXT_PUBLIC_WA_NUMBER && (
            <a
              href={process.env.NEXT_PUBLIC_WA_NUMBER ? buildWhatsAppUrl(process.env.NEXT_PUBLIC_WA_NUMBER, GENERAL_WA_MESSAGE) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-green-500 hover:text-green-400 border border-green-500/30 hover:border-green-400/60 px-3 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}
          <Link
            href="/catalogo"
            className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ver catálogo
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
            {process.env.NEXT_PUBLIC_WA_NUMBER && (
              <a
                href={process.env.NEXT_PUBLIC_WA_NUMBER ? buildWhatsAppUrl(process.env.NEXT_PUBLIC_WA_NUMBER, GENERAL_WA_MESSAGE) : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-semibold text-green-500 hover:bg-green-500/10 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp
              </a>
            )}
            <Link
              href="/catalogo"
              onClick={() => setIsOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors"
            >
              Ver catálogo
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
