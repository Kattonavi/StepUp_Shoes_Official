'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import type { ApiResponse } from '@/types'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin')
    }
  }, [authLoading, isAuthenticated, router])

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      await login(data)
      router.replace('/admin')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const apiData = err.response?.data as ApiResponse<unknown> | undefined
        const msg = apiData?.message

        if (status === 401) {
          setServerError('Email o contraseña incorrectos.')
        } else if (status === 429) {
          // Rate-limited — surface the backend message if present, otherwise
          // a friendly default. We never expose remaining-time details.
          setServerError(
            msg ?? 'Demasiados intentos. Intenta nuevamente en unos minutos.'
          )
        } else if (status === 403) {
          setServerError(msg ?? 'Tu cuenta está bloqueada o inactiva.')
        } else if (status === 0 || !err.response) {
          setServerError(
            'No pudimos conectar con el servidor. Verifica tu conexión.'
          )
        } else {
          setServerError(msg ?? 'Error al iniciar sesión. Intenta nuevamente.')
        }
      } else {
        setServerError('Error inesperado. Intenta nuevamente.')
      }
    }
  }

  // Mientras valida sesión existente
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isDisabled = isSubmitting

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold hover:text-primary transition-colors">
          <Zap className="w-6 h-6 text-primary" />
          StepUp
        </Link>
        <p className="text-muted-foreground text-sm mt-2">
          Panel administrativo
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-lg shadow-black/20">
        <h1 className="text-xl font-bold mb-6">Iniciar sesión</h1>

        {/* Server error */}
        {serverError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 mb-5">
            <p className="text-destructive text-sm">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isDisabled}
              placeholder="admin@stepup.com"
              className={cn(
                'w-full bg-background border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
                errors.email ? 'border-destructive' : 'border-input'
              )}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1.5">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isDisabled}
                placeholder="••••••••"
                className={cn(
                  'w-full bg-background border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed pr-10',
                  errors.password ? 'border-destructive' : 'border-input'
                )}
                {...register('password')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs mt-1.5">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Acceso restringido al personal autorizado
      </p>
    </div>
  )
}
