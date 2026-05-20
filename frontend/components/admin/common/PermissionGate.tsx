import type { Role } from '@/types'

// ─── Role level map ──────────────────────────────────────────────────────────

const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 5,
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
}

// ─── Permission helpers ──────────────────────────────────────────────────────

export const PRODUCT_PERMISSIONS = {
  canView: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR'] as Role[]).includes(role),
  canCreate: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR'] as Role[]).includes(role),
  canEdit: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR'] as Role[]).includes(role),
  canChangeVisibility: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR'] as Role[]).includes(role),
  canChangeStatus: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER', 'ADMIN'] as Role[]).includes(role),
  canChangeStock: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR'] as Role[]).includes(role),
  canDelete: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER'] as Role[]).includes(role),
  canRestore: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER'] as Role[]).includes(role),
}

export const CATEGORY_PERMISSIONS = {
  canManage: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER', 'ADMIN'] as Role[]).includes(role),
  canDelete: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER'] as Role[]).includes(role),
  canRestore: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER'] as Role[]).includes(role),
}

// ─── User permissions ────────────────────────────────────────────────────────

/**
 * Returns the roles this caller can assign to new/edited users.
 * SUPER_ADMIN cannot be assigned via the UI (backend enforces too).
 */
export function getAssignableRoles(callerRole: Role): Role[] {
  if (callerRole === 'SUPER_ADMIN') return ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']
  if (callerRole === 'OWNER') return ['ADMIN', 'EDITOR', 'VIEWER']
  return []
}

export const USER_PERMISSIONS = {
  /** Only SUPER_ADMIN and OWNER can access user management */
  canAccess: (role: Role) =>
    (['SUPER_ADMIN', 'OWNER'] as Role[]).includes(role),

  /** Whether caller can see a specific user in the list */
  canSeeUser: (callerRole: Role, targetRole: Role) => {
    if (callerRole === 'SUPER_ADMIN') return true
    return targetRole !== 'SUPER_ADMIN'
  },

  /**
   * Whether caller can edit/change role/status of a target user.
   * SUPER_ADMIN users cannot be modified by anyone (backend enforces).
   * Self-modification of role/status is disallowed in the UI.
   */
  canEditUser: (callerRole: Role, targetRole: Role, isSelf: boolean) => {
    if (targetRole === 'SUPER_ADMIN') return false
    if (isSelf) return false // Allow editing own fullName only via dedicated flow
    return ROLE_LEVEL[callerRole] > ROLE_LEVEL[targetRole]
  },

  /** Whether caller can edit their own fullName (everyone with access can) */
  canEditOwnFullName: (callerRole: Role) =>
    (['SUPER_ADMIN', 'OWNER'] as Role[]).includes(callerRole),

  /** Whether the caller can assign a specific role */
  canAssignRole: (callerRole: Role, targetRole: Role) => {
    if (targetRole === 'SUPER_ADMIN') return false
    return ROLE_LEVEL[callerRole] > ROLE_LEVEL[targetRole]
  },
}

// ─── PermissionGate component ────────────────────────────────────────────────

interface PermissionGateProps {
  allowed: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function PermissionGate({
  allowed,
  children,
  fallback = null,
}: PermissionGateProps) {
  return allowed ? <>{children}</> : <>{fallback}</>
}
