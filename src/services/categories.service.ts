import { createClient } from '@/lib/supabase/client'
import type { CreateCategoryInput, UpdateCategoryInput } from '@/schemas/category.schema'
import type { Tables } from '@/lib/supabase/client'

export type Category = Tables<'categories'>

export interface CategoryWithProductCount extends Category {
  product_count?: number
}

export class CategoriesService {
  private supabase = createClient()

  async getCategories(tenantId: string): Promise<CategoryWithProductCount[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select(`
          *,
          products (count)
        `)
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true })

      if (error) throw error

      return (data || []).map((category: any) => ({
        ...category,
        product_count: category.products?.[0]?.count || 0,
        products: undefined,
      }))
    } catch (error) {
      console.error('[CategoriesService] Error fetching categories:', error)
      throw error
    }
  }

  async getCategoryById(id: string, tenantId: string): Promise<Category | null> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('[CategoriesService] Error fetching category:', error)
      throw error
    }
  }

  async createCategory(input: CreateCategoryInput, tenantId: string): Promise<Category> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .insert({
          ...input,
          tenant_id: tenantId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('[CategoriesService] Error creating category:', error)
      throw error
    }
  }

  async updateCategory(
    id: string,
    input: UpdateCategoryInput,
    tenantId: string
  ): Promise<Category> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .update(input)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('[CategoriesService] Error updating category:', error)
      throw error
    }
  }

  async deleteCategory(id: string, tenantId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId)

      if (error) throw error
    } catch (error) {
      console.error('[CategoriesService] Error deleting category:', error)
      throw error
    }
  }
}

export const categoriesService = new CategoriesService()
