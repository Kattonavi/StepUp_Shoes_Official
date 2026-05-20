import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  backHref?: string
  action?: {
    label: string
    href: string
  }
}

export default function AdminPageHeader({
  title,
  description,
  backHref,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </Link>
      )}
    </div>
  )
}
