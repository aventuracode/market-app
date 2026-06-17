import type { Money } from '@/lib/money'
import { Database } from '@/types/supabase.generated'

type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type UnitType = 'UNIT' | 'GRAM' | 'KILOGRAM' | 'LITER' | 'MILLILITER'

// Product with Money fields instead of number
export type Product = Omit<Tables<'products'>, 'sale_price' | 'cost_price' | 'barcode' | 'created_at' | 'updated_at' | 'is_active' | 'minimum_stock'> & {
  sale_price: Money
  cost_price: Money
  barcode: string | null
  created_at: string
  updated_at: string
  is_active: boolean
  minimum_stock: number
}



// Category with non-null fields
export type Category = Omit<Tables<'categories'>, 'created_at' | 'updated_at' | 'is_active'> & {
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface ProductWithCategory extends Product {
  category: Category | null
}

export interface ProductSearchParams {
  query?: string
  categoryId?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

export interface ProductSearchResult {
  products: ProductWithCategory[]
  total: number
  hasMore: boolean
}

export interface UnitTypeOption {
  value: UnitType
  label: string
  abbreviation: string
}

export const UNIT_TYPE_OPTIONS: UnitTypeOption[] = [
  { value: 'UNIT', label: 'Unidad', abbreviation: 'un' },
  { value: 'GRAM', label: 'Gramo', abbreviation: 'g' },
  { value: 'KILOGRAM', label: 'Kilogramo', abbreviation: 'kg' },
  { value: 'LITER', label: 'Litro', abbreviation: 'l' },
  { value: 'MILLILITER', label: 'Mililitro', abbreviation: 'ml' },
]

// Params para crear producto
export type CreateProductParams = Omit<Inserts<'products'>, 'id' | 'created_at' | 'updated_at'>

// Params para actualizar producto
export type UpdateProductParams = Omit<Updates<'products'>, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
