import type { Tables } from '@/shared/supabase/types'
import type { Category } from './product'
import type { CategoryWithProductCount } from './category.schema'

/**
 * Category DB type (raw from Supabase)
 */
export type CategoryDB = Tables<'categories'>

/**
 * Raw category with product count from Supabase query
 */
type RawCategoryWithProductCount = CategoryDB & {
  products?: Array<{ count: number }>
}

/**
 * Normaliza una categoría de DB a tipo de dominio
 * - Garantiza created_at como string (no null)
 * - Garantiza updated_at como string (no null)
 * - Garantiza is_active como boolean (no null)
 */
export function mapCategory(raw: CategoryDB): Category {
  return {
    ...raw,
    created_at: raw.created_at ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? new Date().toISOString(),
    is_active: raw.is_active ?? true,
  }
}

/**
 * Normaliza una categoría con conteo de productos
 */
export function mapCategoryWithProductCount(raw: RawCategoryWithProductCount): CategoryWithProductCount {
  return {
    ...mapCategory(raw),
    product_count: raw.products?.[0]?.count || 0,
  }
}

/**
 * Batch mapper para categorías
 */
export function mapCategories(raws: CategoryDB[]): Category[] {
  return raws.map(mapCategory)
}

/**
 * Batch mapper para categorías con conteo de productos
 */
export function mapCategoriesWithProductCount(raws: RawCategoryWithProductCount[]): CategoryWithProductCount[] {
  return raws.map(mapCategoryWithProductCount)
}
