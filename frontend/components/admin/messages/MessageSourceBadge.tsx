import type { MessageSource } from '@/types'

const SOURCE_CONFIG: Record<MessageSource, { label: string; classes: string }> = {
  CONTACT_FORM:    { label: 'Formulario',    classes: 'bg-blue-500/15 text-blue-400' },
  PRODUCT_INQUIRY: { label: 'Producto',      classes: 'bg-purple-500/15 text-purple-400' },
  WHATSAPP_CTA:    { label: 'WhatsApp',      classes: 'bg-emerald-500/15 text-emerald-400' },
  ADMIN_CREATED:   { label: 'Admin',         classes: 'bg-orange-500/15 text-orange-400' },
  SYSTEM:          { label: 'Sistema',       classes: 'bg-muted text-muted-foreground' },
}

export default function MessageSourceBadge({ source }: { source: MessageSource }) {
  const cfg = SOURCE_CONFIG[source] ?? { label: source, classes: 'bg-muted text-muted-foreground' }
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}
