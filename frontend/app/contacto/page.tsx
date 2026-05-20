import type { Metadata } from 'next'
import { Mail, Phone, MessageSquare } from 'lucide-react'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contacto — StepUp',
  description: '¿Tienes dudas sobre algún producto? Escríbenos y te respondemos a la brevedad.',
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Contáctanos</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          ¿Tienes dudas sobre tallas, disponibilidad o algún producto? Escríbenos
          y te respondemos a la brevedad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Info col */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Información de contacto
            </h2>
            <div className="space-y-4">
              {process.env.NEXT_PUBLIC_WA_NUMBER && (
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">+{process.env.NEXT_PUBLIC_WA_NUMBER}</p>
                  </div>
                </a>
              )}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Formulario de contacto</p>
                  <p className="text-xs">Respuesta en 24-48 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Horario de atención</p>
                  <p className="text-xs">Lun – Sáb · 9:00 am – 6:00 pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form col */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6">
          <ContactForm source="CONTACT_FORM" />
        </div>
      </div>
    </div>
  )
}
