'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { fadeUp, stagger, VIEWPORT_ONCE } from './motion'

interface HomeFinalCTAProps {
  waHref: string
  catalogUrl?: string
}

export default function HomeFinalCTA({
  waHref,
  catalogUrl = '/catalogo',
}: HomeFinalCTAProps) {
  return (
    <section className="relative py-16 md:py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          variants={stagger}
          className="relative overflow-hidden rounded-3xl px-6 py-14 md:px-16 md:py-20 text-center"
          style={{
            background:
              'radial-gradient(120% 120% at 0% 0%, #F26A21 0%, #c54a0d 40%, #6e2806 100%)',
          }}
        >
          {/* Decoration */}
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-black/15 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute top-1/2 right-12 -translate-y-1/2 w-3 h-3 rounded-full bg-white/40 pointer-events-none hidden md:block"
            aria-hidden
          />
          <div
            className="absolute top-12 left-12 w-2 h-2 rounded-full bg-white/30 pointer-events-none hidden md:block"
            aria-hidden
          />

          {/* Content */}
          <div className="relative">
            <motion.p
              variants={fadeUp}
              className="text-white/75 text-xs font-bold uppercase tracking-[0.25em] mb-5"
            >
              Habla con nosotros
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.05] mb-5"
            >
              Tu próximo par,
              <br />
              <span className="text-white/85">a un mensaje de distancia.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-white/85 max-w-lg mx-auto mb-10 text-base leading-relaxed"
            >
              Dinos qué buscas. Te confirmamos talla, stock y forma de pago al
              instante por WhatsApp. Sin cuenta, sin filas.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {/*
                WhatsApp primary CTA. We use the WhatsApp brand green (#25D366)
                with explicit white text so contrast is correct on the orange
                gradient AND in dark/light modes — never depends on the theme's
                `--foreground` token (the previous bg-white + text-foreground
                combo rendered as white-on-white in dark mode).
              */}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#1ebe57] active:scale-[0.98] transition-all duration-200 text-base shadow-xl shadow-black/40 ring-1 ring-white/20"
              >
                <MessageCircle className="w-5 h-5" />
                Escríbenos por WhatsApp
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <Link
                href={catalogUrl}
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-200 text-base"
              >
                Ver catálogo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
