import { createClient as createServerClient } from './server'
import { getCurrentTenantId } from './auth-helpers'
import type { Tenant } from '@/features/auth'
import { mapTenant } from '@/features/auth'

export async function getCurrentTenant(): Promise<Tenant | null> {
  const tenantId = await getCurrentTenantId()

  if (!tenantId) {
    return null
  }

  const supabase = await createServerClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  if (!tenant) return null

  return mapTenant(tenant)
}

export async function requireTenant(): Promise<Tenant> {
  const tenant = await getCurrentTenant()

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  return tenant
}

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const supabase = await createServerClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  if (!tenant) return null

  return mapTenant(tenant)
}

export function withTenantIsolation<T extends { tenant_id: string }>(
  query: T,
  tenantId: string
): T {
  return {
    ...query,
    tenant_id: tenantId,
  }
}
