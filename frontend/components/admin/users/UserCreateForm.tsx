'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreateUserRequest, Role } from '@/types'
import { getAssignableRoles } from '@/components/admin/common/PermissionGate'
import UserRoleBadge from './UserRoleBadge'

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visor',
}

const createSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  fullName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(255, 'Máx 255 caracteres'),
  role: z.enum([
    'SUPER_ADMIN',
    'OWNER',
    'ADMIN',
    'EDITOR',
    'VIEWER',
  ] as const),
})

type CreateFormValues = z.infer<typeof createSchema>

interface UserCreateFormProps {
  callerRole: Role
  onSubmit: (data: CreateUserRequest) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function UserCreateForm({
  callerRole,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UserCreateFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const assignableRoles = getAssignableRoles(callerRole)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      role: assignableRoles[0] ?? 'VIEWER',
    },
  })

  const handleFormSubmit = async (values: CreateFormValues) => {
    await onSubmit(values as CreateUserRequest)
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">
          Información del usuario
        </h2>

        {/* Full name */}
        <FormField label="Nombre completo *" error={errors.fullName?.message}>
          <input
            placeholder="Juan García"
            disabled={isSubmitting}
            className={cn(
              'w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60',
              errors.fullName ? 'border-destructive' : 'border-border'
            )}
            {...register('fullName')}
          />
        </FormField>

        {/* Email */}
        <FormField label="Email *" error={errors.email?.message}>
          <input
            type="email"
            placeholder="juan@ejemplo.com"
            autoComplete="off"
            disabled={isSubmitting}
            className={cn(
              'w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60',
              errors.email ? 'border-destructive' : 'border-border'
            )}
            {...register('email')}
          />
        </FormField>

        {/* Password */}
        <FormField label="Contraseña *" error={errors.password?.message}>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              disabled={isSubmitting}
              className={cn(
                'w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60 pr-10',
                errors.password ? 'border-destructive' : 'border-border'
              )}
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>

        {/* Role */}
        <FormField
          label="Rol *"
          hint="Solo puedes asignar roles con nivel menor al tuyo"
          error={errors.role?.message}
        >
          <select
            disabled={isSubmitting}
            className={cn(
              'w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60',
              errors.role ? 'border-destructive' : 'border-border'
            )}
            {...register('role')}
          >
            {assignableRoles.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>

          {/* Role description */}
          <div className="flex flex-wrap gap-2 mt-2">
            {assignableRoles.map((r) => (
              <UserRoleBadge key={r} role={r} />
            ))}
          </div>
        </FormField>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || assignableRoles.length === 0}
          className="px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Crear usuario
        </button>
      </div>
    </form>
  )
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium block">
        {label}
        {hint && (
          <span className="text-xs text-muted-foreground ml-2 font-normal">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
