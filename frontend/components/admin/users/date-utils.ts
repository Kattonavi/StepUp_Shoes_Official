/** Formats an ISO string into a simple "hace X tiempo" label */
export function formatDistanceToNow(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 30) {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: diffDay > 365 ? 'numeric' : undefined,
    })
  }
  if (diffDay >= 1) return `hace ${diffDay}d`
  if (diffHour >= 1) return `hace ${diffHour}h`
  if (diffMin >= 1) return `hace ${diffMin}m`
  return 'Ahora'
}
