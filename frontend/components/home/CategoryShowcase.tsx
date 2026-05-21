import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryShowcaseProps {
  categories: Category[]
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (!categories.length) return null

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary rounded" />
              Colecciones
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Explora por
              <br />
              <span className="text-primary">categoría</span>
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categorySlug=${cat.slug}`}
              className="group relative overflow-hidden bg-card border border-border rounded-2xl p-6 text-center transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-2xl" />

              {/* Icon */}
              {cat.icon ? (
                <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110 leading-none">
                  {cat.icon}
                </div>
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              )}

              <p className="font-bold text-sm group-hover:text-primary transition-colors">
                {cat.name}
              </p>
              {cat.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {cat.description}
                </p>
              )}

              {/* Arrow indicator on hover */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "ver todas" */}
        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/catalogo"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Ver todas las categorías →
          </Link>
        </div>
      </div>
    </section>
  )
}
