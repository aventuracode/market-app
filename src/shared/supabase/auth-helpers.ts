import { createClient as createServerClient } from './server'
import type { UserProfile } from '@/features/auth'
import { mapUserProfile } from '@/features/auth'

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createServerClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) return null

  return mapUserProfile(user, authUser.email || '')
}

export async function getCurrentTenantId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.tenantId ?? null
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireRole(
  allowedRoleIds: number[]
): Promise<UserProfile> {
  const user = await requireAuth()

  if (!user.roleId || !allowedRoleIds.includes(user.roleId)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return user
}

export async function getSession() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}
