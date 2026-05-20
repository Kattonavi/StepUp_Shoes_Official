'use client'

// Re-export desde AuthProvider para que los componentes importen
// desde @/hooks/useAuth sin necesidad de saber la ubicación del contexto.
export { useAuth } from '@/components/providers/AuthProvider'
