const SESSION_KEY = 'stepup_sid'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/** Returns the current session ID, creating and persisting one if needed. */
export function getSessionId(): string | undefined {
  if (!isBrowser()) return undefined
  try {
    let sid = localStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = generateId()
      localStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    return undefined
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
