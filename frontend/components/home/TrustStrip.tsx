import { MessageCircle, ShieldCheck, Truck, BadgePercent } from 'lucide-react'

/**
 * Compact trust strip rendered between the hero and the catalog content.
 * Reads as "social proof" without taking vertical space like BenefitsSection.
 */
const TRUST = [
  { icon: MessageCircle, label: 'Atención por WhatsApp', sub: 'Respuesta rápida' },
  { icon: ShieldCheck,   label: 'Producto verificado',   sub: 'Antes de enviar' },
  { icon: Truck,         label: 'Envíos a toda Colombia', sub: 'Coordinamos por chat' },
  { icon: BadgePercent,  label: 'Precios honestos',      sub: 'Sin sorpresas' },
] as const

export default function TrustStrip() {
  return (
    <section className="border-y border-border bg-card/30">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <li
              key={label}
              className="flex items-center gap-3 text-left"
            >
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight truncate">
                  {label}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight truncate">
                  {sub}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
