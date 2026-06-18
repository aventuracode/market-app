import type { Tables } from '@/shared/supabase/types'

/**
 * Raw DB types
 */
export type UserDB = Tables<'users'>
export type TenantDB = Tables<'tenants'>

/**
 * Domain types (normalized)
 */
export type UserRole = 'ADMIN' | 'CAJERO' | 'SUPERVISOR'

export interface UserProfile {
  id: string
  email: string
  tenantId: string
  roleId: number | null
  role: UserRole | null
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface SessionUser {
  id: string
  email: string
}

export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  loading: boolean
}

/**
 * Auth credentials
 */
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData extends LoginCredentials {
  tenantId: string
  firstName?: string
  lastName?: string
  role?: UserRole
}
