import { PackageSearch } from 'lucide-react'

interface ProductEmptyStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export default function ProductEmptyState({
  hasFilters,
  onClearFilters,
}: ProductEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        <PackageSearch className="w-10 h-10 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">
          {hasFilters
            ? 'No encontramos productos con esos filtros'
            : 'El catálogo está vacío por el momento'}
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {hasFilters
            ? 'Prueba ajustando o eliminando los filtros aplicados.'
            : 'Vuelve pronto, estamos preparando algo especial.'}
        </p>
      </div>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
