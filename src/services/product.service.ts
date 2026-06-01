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
      
      // Si el error es "not found", retornar null
      if (error.code === 'PGRST116') {
        return null
      }
      
      // Para otros errores, lanzar excepción
      throw new Error(error.message || 'Error al obtener el producto')
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
      .maybeSingle()

    if (error) {
      console.error('Error getting product by barcode:', error)
      return null
    }

    // Si no se encontró el producto, retornar null sin error
    if (!data) {
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

  /**
   * Crear producto
   */
  async createProduct(productData: {
    tenant_id: string
    name: string
    description?: string | null
    barcode: string
    sku?: string | null
    category_id?: string | null
    sale_price: number
    cost_price?: number | null
    stock: number
    minimum_stock: number
    is_active?: boolean
  }): Promise<Product> {
    // Validar que el código de barras no exista
    const existing = await this.getProductByBarcode(
      productData.tenant_id,
      productData.barcode
    )

    if (existing) {
      throw new Error('Ya existe un producto con este código de barras')
    }

    const { data, error } = await this.supabase
      .from('products')
      .insert({
        ...productData,
        is_active: productData.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      
      // Mensajes de error más específicos
      if (error.code === '23505') {
        throw new Error('Ya existe un producto con este código de barras')
      }
      if (error.code === '23503') {
        throw new Error('La categoría seleccionada no existe')
      }
      if (error.message.includes('RLS')) {
        throw new Error('No tienes permisos para crear productos')
      }
      
      throw new Error(error.message || 'Error al crear el producto')
    }

    if (!data) {
      throw new Error('No se recibió respuesta del servidor')
    }

    return data
  }

  /**
   * Actualizar producto
   */
  async updateProduct(
    productId: string,
    updates: {
      name?: string
      description?: string | null
      barcode?: string
      sku?: string | null
      category_id?: string | null
      sale_price?: number
      cost_price?: number | null
      stock?: number
      minimum_stock?: number
      is_active?: boolean
    }
  ): Promise<Product> {
    // Si se actualiza el código de barras, validar que no exista
    if (updates.barcode) {
      const { data: currentProduct } = await this.supabase
        .from('products')
        .select('tenant_id')
        .eq('id', productId)
        .single()

      if (currentProduct) {
        const existing = await this.getProductByBarcode(
          currentProduct.tenant_id,
          updates.barcode
        )

        if (existing && existing.id !== productId) {
          throw new Error('Ya existe un producto con este código de barras')
        }
      }
    }

    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      throw new Error('Error al actualizar el producto')
    }

    if (!data) {
      throw new Error('No se recibió respuesta del servidor')
    }

    return data
  }

  /**
   * Eliminar producto (soft delete)
   */
  async deleteProduct(productId: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      throw new Error('Error al eliminar el producto')
    }
  }

  /**
   * Restaurar producto
   */
  async restoreProduct(productId: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .update({ is_active: true })
      .eq('id', productId)

    if (error) {
      console.error('Error restoring product:', error)
      throw new Error('Error al restaurar el producto')
    }
  }
}

export const productService = new ProductService()
