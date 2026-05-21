import { PackageSearch, SlidersHorizontal } from 'lucide-react'

interface ProductEmptyStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export default function ProductEmptyState({
  hasFilters,
  onClearFilters,
}: ProductEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        {hasFilters ? (
          <SlidersHorizontal className="w-9 h-9 text-muted-foreground/60" />
        ) : (
          <PackageSearch className="w-9 h-9 text-muted-foreground/60" />
        )}
      </div>
      <div className="max-w-sm">
        <p className="text-lg font-semibold text-foreground">
          {hasFilters
            ? 'Sin resultados para esa búsqueda'
            : 'El catálogo estará disponible muy pronto'}
        </p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {hasFilters
            ? 'No encontramos productos con esos filtros. Prueba cambiando la búsqueda o limpiando los filtros.'
            : 'Estamos preparando nuestro catálogo. Vuelve pronto o escríbenos por WhatsApp para saber qué tenemos disponible.'}
        </p>
      </div>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm font-semibold text-primary hover:text-primary/80 border border-primary/30 hover:border-primary/60 px-5 py-2 rounded-xl transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
