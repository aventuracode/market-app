import { money } from '@/shared/utils'
import type { Product, Category, ProductWithCategory } from '@/features/products/domain/product'
import type { Tables } from '@/shared/supabase/types'

type CategoryDB = Tables<'categories'>
type ProductDB = Tables<'products'>

type RawProductWithCategory = ProductDB & {
  category: CategoryDB | null
}

export function mapCategory(raw: CategoryDB): Category {
  return {
    ...raw,
    created_at: raw.created_at ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? new Date().toISOString(),
    is_active: raw.is_active ?? true,
  }
}

export function mapProduct(raw: ProductDB): Product {
  return {
    ...raw,
    sale_price: money(raw.sale_price),
    cost_price: money(raw.cost_price),
    barcode: raw.barcode ?? null,
    is_active: raw.is_active ?? true,
    minimum_stock: raw.minimum_stock ?? 0,
    created_at: raw.created_at ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? new Date().toISOString(),
  }
}

export function mapProductWithCategory(raw: RawProductWithCategory): ProductWithCategory {
  return {
    ...mapProduct(raw),
    category: raw.category ? mapCategory(raw.category) : null,
  }
}

export function mapProducts(raws: RawProductWithCategory[]): ProductWithCategory[] {
  return raws.map(mapProductWithCategory)
}
