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

  return user
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
  allowedRoles: Array<'ADMIN' | 'CAJERO' | 'SUPERVISOR'>
): Promise<User> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
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
