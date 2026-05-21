import { ShieldCheck, MessageCircle, Sparkles, Package } from 'lucide-react'
import type { ElementType } from 'react'

interface Benefit {
  icon: ElementType
  iconClass: string
  title: string
  desc: string
}

const BENEFITS: Benefit[] = [
  {
    icon: ShieldCheck,
    iconClass: 'text-primary bg-primary/10',
    title: 'Productos seleccionados',
    desc: 'Cada referencia pasa por un filtro de calidad antes de llegar a ti.',
  },
  {
    icon: MessageCircle,
    iconClass: 'text-green-400 bg-green-500/10',
    title: 'Atención por WhatsApp',
    desc: 'Respuesta rápida y directa. Sin filas, sin complicaciones.',
  },
  {
    icon: Sparkles,
    iconClass: 'text-blue-400 bg-blue-500/10',
    title: 'Estilo personalizado',
    desc: 'Te ayudamos a encontrar la talla y opción que mejor te quede.',
  },
  {
    icon: Package,
    iconClass: 'text-primary bg-primary/10',
    title: 'Siempre actualizados',
    desc: 'Nuevas referencias frecuentemente. Siempre hay algo nuevo.',
  },
]

export default function BenefitsSection() {
  return (
    <section className="py-24 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center justify-center gap-2">
            <span className="w-5 h-0.5 bg-primary rounded" />
            ¿Por qué elegirnos?
            <span className="w-5 h-0.5 bg-primary rounded" />
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Comprar es{' '}
            <span className="text-primary">fácil</span> y confiable
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(({ icon: Icon, iconClass, title, desc }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-colors duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
