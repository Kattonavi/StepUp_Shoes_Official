export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 h-24" />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 h-64" />
        ))}
      </div>

      {/* Activity + products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 h-72" />
        <div className="bg-card border border-border rounded-xl p-5 h-72" />
      </div>
    </div>
  )
}
