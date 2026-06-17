import { Role } from '@/features/sales/domain/sales.types'
import type { Database } from './supabase.generated'

type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']



export type User = Omit<Tables<'users'>, 'is_active' | 'created_at' | 'updated_at' | 'role_id'> & {
  email?: string
  role?: Role
  role_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Tenant = Omit<Tables<'tenants'>, 'created_at'> & {
  created_at: string
}
