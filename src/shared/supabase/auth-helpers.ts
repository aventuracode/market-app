import { createClient as createServerClient } from './server'
import type { User } from '@/types'

export async function getCurrentUser(): Promise<User | null> {
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

  return {
    ...user,
    email: authUser.email,
    role_id: user.role_id,
    is_active: user.is_active ?? true,
    created_at: user.created_at ?? new Date().toISOString(),
    updated_at: user.updated_at ?? new Date().toISOString(),
  }
}

export async function getCurrentTenantId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.tenant_id ?? null
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireRole(
  allowedRoleIds: number[]
): Promise<User> {
  const user = await requireAuth()

  if (!user.role_id || !allowedRoleIds.includes(user.role_id)) {
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
