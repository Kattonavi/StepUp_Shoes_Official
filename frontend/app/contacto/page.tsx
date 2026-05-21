import type { Metadata } from 'next'
import { Mail, Clock, MessageCircle } from 'lucide-react'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contacto — StepUp',
  description: '¿Tienes dudas sobre tallas, disponibilidad o referencias? Escríbenos y te respondemos a la brevedad.',
}

export default function ContactPage() {
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Estamos aquí para ayudarte</p>
        <h1 className="text-3xl font-bold mb-3">Hablemos</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          ¿Tienes dudas sobre tallas, disponibilidad o referencias? Escríbenos y te respondemos lo más pronto posible.
        </p>
      </div>

      {/* WhatsApp prominent CTA */}
      {waNumber && (
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-green-500 text-white font-semibold py-4 rounded-2xl hover:bg-green-600 active:scale-[0.98] transition-all text-base shadow-lg shadow-green-500/20 mb-10"
        >
          <MessageCircle className="w-5 h-5" />
          Escribir por WhatsApp ahora
        </a>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Info col */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Información de contacto
            </h2>
            <div className="space-y-4">
              {waNumber ? (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-green-500 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Respuesta rápida</p>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">WhatsApp</p>
                    <p className="text-xs">Usa el formulario →</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Formulario</p>
                  <p className="text-xs">Respuesta en 24–48 horas</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Horario</p>
                  <p className="text-xs">Lun – Sáb · 9:00 am – 6:00 pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tip
            </p>
            <p className="text-sm text-foreground">
              Si tienes el código de referencia del producto que te interesa, inclúyelo en tu mensaje para una respuesta más rápida.
            </p>
          </div>
        </div>

        {/* Form col */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-1">Envíanos un mensaje</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Compártenos tu consulta y te contactamos a la brevedad.
          </p>
          <ContactForm source="CONTACT_FORM" />
        </div>
      </div>
    </div>
  )
}
