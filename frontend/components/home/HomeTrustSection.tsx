'use client'

import { motion } from 'framer-motion'
import {
  ShieldCheck,
  MessageCircle,
  Truck,
  BadgePercent,
  Sparkles,
  Ruler,
} from 'lucide-react'
import type { ElementType } from 'react'
import { fadeUp, scaleIn, stagger, VIEWPORT_ONCE } from './motion'

interface Benefit {
  icon: ElementType
  title: string
  desc: string
  tint: string
  iconColor: string
}

const BENEFITS: Benefit[] = [
  {
    icon: MessageCircle,
    title: 'Compra por WhatsApp',
    desc: 'Sin cuenta, sin filas. Te respondemos hoy mismo.',
    tint: 'from-green-500/15 to-green-500/5 border-green-500/25',
    iconColor: 'text-green-400',
  },
  {
    icon: ShieldCheck,
    title: 'Calidad garantizada',
    desc: 'Revisamos cada par antes de que salga. Lo que ves, recibes.',
    tint: 'from-primary/15 to-primary/5 border-primary/25',
    iconColor: 'text-primary',
  },
  {
    icon: Truck,
    title: 'Llegamos a toda Colombia',
    desc: 'Coordinamos el envío contigo, sin intermediarios.',
    tint: 'from-blue-500/15 to-blue-500/5 border-blue-500/25',
    iconColor: 'text-blue-400',
  },
  {
    icon: BadgePercent,
    title: 'Precios sin trampa',
    desc: 'Cero costos ocultos. El precio que ves, es el que pagas.',
    tint: 'from-amber-500/15 to-amber-500/5 border-amber-500/25',
    iconColor: 'text-amber-300',
  },
  {
    icon: Ruler,
    title: 'Te asesoramos la talla',
    desc: 'Acertamos contigo antes de comprar. Cero cambios fallidos.',
    tint: 'from-purple-500/15 to-purple-500/5 border-purple-500/25',
    iconColor: 'text-purple-300',
  },
  {
    icon: Sparkles,
    title: 'Drops cada semana',
    desc: 'Nuevas referencias seleccionadas a mano. Siempre algo fresco.',
    tint: 'from-pink-500/15 to-pink-500/5 border-pink-500/25',
    iconColor: 'text-pink-300',
  },
]

export default function HomeTrustSection() {
  return (
    <section className="relative py-16 md:py-24 px-4 bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
        <div
          className="absolute bottom-0 right-1/3 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center justify-center gap-2"
          >
            <span className="w-5 h-0.5 bg-primary rounded" />
            ¿Por qué elegirnos?
            <span className="w-5 h-0.5 bg-primary rounded" />
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05]"
          >
            Comprar contigo, <span className="text-primary">como debería ser</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {BENEFITS.map(({ icon: Icon, title, desc, tint, iconColor }) => (
            <motion.div
              key={title}
              variants={scaleIn}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className={`group relative rounded-2xl border bg-gradient-to-br ${tint} p-6 backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-primary/5`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-12 h-12 rounded-xl bg-background/60 border border-border flex items-center justify-center shrink-0 ${iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-foreground leading-tight">
                  {title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
