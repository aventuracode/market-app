import { createClient } from '@/lib/supabase/client'
import { money } from '@/lib/money'
import type { 
  Product, 
  ProductWithCategory, 
  ProductSearchParams, 
  ProductSearchResult,
  CreateProductParams,
  UpdateProductParams
} from '@/features/products/domain/product'
import { mapProducts, mapProductWithCategory } from './product.mapper'

export class ProductService {
  private supabase = createClient()

  async getProducts(tenantId: string): Promise<ProductWithCategory[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      throw new Error('Error al obtener productos')
    }

    return mapProducts(data ?? [])
  }

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

    const products = mapProducts(data ?? [])
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

    return mapProductWithCategory(data)
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

    return mapProductWithCategory(data)
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

    return (data || []).map(cat => ({
      ...cat,
      is_active: cat.is_active ?? true,
      created_at: cat.created_at ?? new Date().toISOString(),
      updated_at: cat.updated_at ?? new Date().toISOString(),
    }))
  }

  /**
   * Crear producto
   */
  async createProduct(
    tenantId: string,
    productData: Omit<CreateProductParams, 'tenant_id'>
  ): Promise<Product> {
    const fullData = {
      ...productData,
      tenant_id: tenantId,
    }
    // Validar que el código de barras no exista
    if (fullData.barcode) {
      const existing = await this.getProductByBarcode(
        tenantId,
        fullData.barcode
      )

      if (existing) {
        throw new Error('Ya existe un producto con este código de barras')
      }
    }

    const { data, error } = await this.supabase
      .from('products')
      .insert({
        ...fullData,
        sale_price: money(fullData.sale_price),
        cost_price: fullData.cost_price !== undefined ? money(fullData.cost_price) : 0,
        is_active: fullData.is_active ?? true,
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

    return {
      ...data,
      sale_price: money(data.sale_price),
      cost_price: money(data.cost_price),
      barcode: data.barcode,
      is_active: data.is_active ?? true,
      minimum_stock: data.minimum_stock ?? 0,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(
    productId: string,
    tenantId: string,
    updates: UpdateProductParams
  ): Promise<Product> {
    // Sanitizar precios si están presentes
    const sanitizedUpdates = {
      ...updates,
      ...(updates.sale_price !== undefined && { sale_price: money(updates.sale_price) }),
      ...(updates.cost_price !== undefined && { cost_price: money(updates.cost_price) }),
    }

    // Si se actualiza el código de barras, validar que no exista
    if (sanitizedUpdates.barcode) {     
        const existing = await this.getProductByBarcode(
          tenantId,
          sanitizedUpdates.barcode
        )

        if (existing && existing.id !== productId) {
          throw new Error('Ya existe un producto con este código de barras')
        }
    }

    const { data, error } = await this.supabase
      .from('products')
      .update(sanitizedUpdates)
      .eq('id', productId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      throw new Error('Error al actualizar el producto')
    }

    if (!data) {
      throw new Error('No se recibió respuesta del servidor')
    }

    return {
      ...data,
      sale_price: money(data.sale_price),
      cost_price: money(data.cost_price),
      barcode: data.barcode,
      is_active: data.is_active ?? true,
      minimum_stock: data.minimum_stock ?? 0,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    }
  }

  /**
   * Eliminar producto (soft delete)
   */
  async deleteProduct(productId: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error deleting product:', error)
      throw new Error('Error al eliminar el producto')
    }
  }

  /**
   * Restaurar producto
   */
  async restoreProduct(productId: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .update({ is_active: true })
      .eq('id', productId)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error restoring product:', error)
      throw new Error('Error al restaurar el producto')
    }
  }
}

export const productService = new ProductService()
