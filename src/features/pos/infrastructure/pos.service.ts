import { productService } from '@/features/products/infrastructure/product.service'
import type { ProductWithCategory } from '@/features/products/domain/product'

export class POSService {
  async searchProducts(tenantId: string, query: string, limit: number = 20) {
    return productService.searchProducts(tenantId, {
      query,
      isActive: true,
      limit,
    })
  }

  async getProductByBarcode(tenantId: string, barcode: string): Promise<ProductWithCategory | null> {
    return productService.getProductByBarcode(tenantId, barcode)
  }

  async validateProductForSale(product: ProductWithCategory): Promise<{
    valid: boolean
    error?: string
  }> {
    if (!product.is_active) {
      return { valid: false, error: 'Producto inactivo' }
    }

    if (product.stock <= 0) {
      return { valid: false, error: 'Producto sin stock' }
    }

    return { valid: true }
  }
}

export const posService = new POSService()
