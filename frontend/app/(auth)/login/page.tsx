import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

// Internal page — never indexed.
export const metadata: Metadata = {
  title: 'Iniciar sesión',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  )
}
