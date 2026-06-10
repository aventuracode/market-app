import type { Money } from '@/lib/money'

export type UnitType = 'UNIT' | 'GRAM' | 'KILOGRAM' | 'LITER' | 'MILLILITER'

export interface Product {
  id: string
  tenant_id: string
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  sale_price: Money
  cost_price: Money
  stock: number
  minimum_stock: number
  category_id: string | null
  unit_type: UnitType
  allow_decimal: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
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
export interface CreateProductParams {
  tenant_id: string
  name: string
  description?: string | null
  barcode: string
  sku?: string | null
  category_id?: string | null
  sale_price: number
  cost_price?: number
  stock: number
  minimum_stock: number
  unit_type?: UnitType
  allow_decimal?: boolean
  is_active?: boolean
}

// Params para actualizar producto
export interface UpdateProductParams {
  name?: string
  description?: string | null
  barcode?: string
  sku?: string | null
  category_id?: string | null
  sale_price?: number
  cost_price?: number
  stock?: number
  minimum_stock?: number
  unit_type?: UnitType
  allow_decimal?: boolean
  is_active?: boolean
}
