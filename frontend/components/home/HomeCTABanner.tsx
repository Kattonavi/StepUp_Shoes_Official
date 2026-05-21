import Link from 'next/link'
import { MessageCircle, ArrowRight } from 'lucide-react'

interface HomeCTABannerProps {
  waHref: string
  catalogUrl?: string
}

export default function HomeCTABanner({ waHref, catalogUrl = '/catalogo' }: HomeCTABannerProps) {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 md:px-16 md:py-20 text-center">
          {/* Decorative shapes */}
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-black/10 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute top-1/2 right-16 -translate-y-1/2 w-3 h-3 rounded-full bg-white/30 pointer-events-none hidden md:block"
            aria-hidden
          />

          {/* Content */}
          <div className="relative">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5">
              Habla con nosotros
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              ¿Tienes dudas?
              <br />
              <span className="text-white/75">Te respondemos rápido.</span>
            </h2>
            <p className="text-white/65 max-w-lg mx-auto mb-12 text-base leading-relaxed">
              Cuéntanos qué buscas y te ayudamos a confirmar disponibilidad, tallas y forma de
              pago. Sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-white text-primary font-black px-8 py-4 rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-base shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </a>
              <Link
                href={catalogUrl}
                className="inline-flex items-center justify-center gap-2 text-white/75 hover:text-white font-semibold px-8 py-4 rounded-2xl border border-white/20 hover:border-white/50 transition-all duration-200 text-base"
              >
                Ver catálogo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
