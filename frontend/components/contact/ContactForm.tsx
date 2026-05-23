'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createMessage } from '@/services/admin-message.service'
import { trackEvent } from '@/services/analytics.service'
import { getSessionId } from '@/lib/analytics-session'
import { getErrorMessage } from '@/lib/error-utils'
import type { MessageSource } from '@/types'

const schema = z.object({
  fullName: z.string().min(2, 'El nombre es obligatorio').max(120),
  email: z.string().email('Email inválido').max(180).optional().or(z.literal('')),
  phone: z.string().max(40).optional(),
  subject: z.string().max(180).optional(),
  content: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje es demasiado largo'),
  // Honeypot — must be empty when humans submit. Hidden from real users in the UI.
  website: z.string().max(100).optional(),
}).refine(
  (d) => (d.email && d.email.length > 0) || (d.phone && d.phone.length > 0),
  { message: 'Debes proporcionar email o teléfono', path: ['email'] }
)

type FormValues = z.infer<typeof schema>

interface ContactFormProps {
  productId?: string
  productName?: string
  source?: MessageSource
  onSuccess?: () => void
}

export default function ContactForm({
  productId,
  productName,
  source = 'CONTACT_FORM',
  onSuccess,
}: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      trackEvent({
        eventType: 'CONTACT_FORM_SUBMIT',
        path: typeof window !== 'undefined' ? window.location.pathname : '/contacto',
        source: source,
        sessionId: getSessionId(),
        metadata: productId ? { productId } : undefined,
      })
      await createMessage({
        fullName: values.fullName,
        email: values.email || undefined,
        phone: values.phone || undefined,
        subject: values.subject || undefined,
        content: values.content,
        productId: productId || undefined,
        source,
        // Honeypot — always send it (empty for humans, filled by bots).
        // Backend treats a non-empty value as "ignore this submission".
        website: values.website || undefined,
      })
      toast.success('¡Mensaje enviado! Te contactaremos pronto.')
      setSubmitted(true)
      reset()
      onSuccess?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Send className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">¡Mensaje recibido!</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Gracias por contactarnos. Te responderemos a la brevedad.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm text-primary hover:underline mt-2"
        >
          Enviar otro mensaje
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {productName && (
        <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-sm text-muted-foreground">
          Consulta sobre: <span className="font-medium text-foreground">{productName}</span>
        </div>
      )}

      {/* Honeypot — hidden from sighted users, screen readers, and tab order.
          Bots that fill every input get silently dropped server-side. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
      >
        <label htmlFor="contact-website">Website (déjalo en blanco)</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Nombre <span className="text-destructive">*</span>
        </label>
        <input
          {...register('fullName')}
          placeholder="Tu nombre completo"
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {errors.fullName && (
          <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="tu@email.com"
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Teléfono</label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="3001234567"
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">Proporciona email o teléfono.</p>

      <div>
        <label className="block text-sm font-medium mb-1.5">Asunto</label>
        <input
          {...register('subject')}
          placeholder="¿En qué podemos ayudarte?"
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Mensaje <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register('content')}
          rows={5}
          placeholder="Escribe tu mensaje aquí..."
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
        {errors.content && (
          <p className="text-xs text-destructive mt-1">{errors.content.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  )
}
