export interface Product {
  id: string
  tenant_id: string
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  sale_price: number
  cost_price: number | null
  stock: number
  minimum_stock: number
  category_id: string | null
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
