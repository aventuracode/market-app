import type { UserDB, TenantDB, UserProfile, Tenant, UserRole } from './auth.types'

/**
 * Role ID to Role name mapping
 */
const ROLE_MAP: Record<number, UserRole> = {
  1: 'ADMIN',
  2: 'CAJERO',
  3: 'SUPERVISOR',
}

/**
 * Maps raw user DB record to domain UserProfile
 * Converts snake_case to camelCase
 * Normalizes nulls to proper defaults
 */
export function mapUserProfile(raw: UserDB, email?: string): UserProfile {
  return {
    id: raw.id,
    email: email || '',
    tenantId: raw.tenant_id,
    roleId: raw.role_id,
    role: raw.role_id ? ROLE_MAP[raw.role_id] || null : null,
    firstName: raw.first_name || '',
    lastName: raw.last_name || '',
    isActive: raw.is_active ?? true,
    createdAt: raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? new Date().toISOString(),
  }
}

/**
 * Maps raw tenant DB record to domain Tenant
 */
export function mapTenant(raw: TenantDB): Tenant {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    createdAt: raw.created_at ?? new Date().toISOString(),
  }
}
