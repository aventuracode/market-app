import { createClient } from '@/lib/supabase/client'
import type { 
  Product, 
  ProductWithCategory, 
  ProductSearchParams, 
  ProductSearchResult 
} from '@/types/product'

export class ProductService {
  private supabase = createClient()

  async searchProducts(
    tenantId: string,
    params: ProductSearchParams = {}
  ): Promise<ProductSearchResult> {
    const {
      query = '',
      categoryId,
      isActive = true,
      limit = 20,
      offset = 0,
    } = params

    let queryBuilder = this.supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('is_active', isActive)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    // Búsqueda por texto
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`
      )
    }

    // Filtro por categoría
    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId)
    }

    const { data, error, count } = await queryBuilder

    if (error) {
      console.error('Error searching products:', error)
      throw new Error('Error al buscar productos')
    }

    const products = (data || []) as ProductWithCategory[]
    const total = count || 0
    const hasMore = offset + limit < total

    return {
      products,
      total,
      hasMore,
    }
  }

  async getProductById(
    tenantId: string,
    productId: string
  ): Promise<ProductWithCategory | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('tenant_id', tenantId)
      .eq('id', productId)
      .single()

    if (error) {
      console.error('Error getting product:', error)
      return null
    }

    return data as ProductWithCategory
  }

  async getProductByBarcode(
    tenantId: string,
    barcode: string
  ): Promise<ProductWithCategory | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('tenant_id', tenantId)
      .eq('barcode', barcode)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error getting product by barcode:', error)
      return null
    }

    return data as ProductWithCategory
  }

  async getCategories(tenantId: string) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error getting categories:', error)
      return []
    }

    return data || []
  }
}

export const productService = new ProductService()
