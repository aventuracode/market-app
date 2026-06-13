/**
 * Tipos consolidados para el sistema de ventas
 * Fuente única de verdad basada en Supabase + normalizaciones de dominio
 */
import type { Money } from '@/lib/money'
import type { Database } from '../../../types/supabase.generated'

// ============================================================================
// HELPERS DE SUPABASE
// ============================================================================

type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// ============================================================================
// ENUMS
// ============================================================================

export type PaymentMethod = Database['public']['Enums']['payment_method']

export type SaleStatus = 'COMPLETED' | 'CANCELLED' | 'PENDING'

// ============================================================================
// TIPOS BASE DE DB (sin normalizar)
// ============================================================================

/**
 * Venta tal como viene de la base de datos
 * Usar solo para operaciones de lectura/escritura directas
 */
export type SaleDB = Tables<'sales'>

/**
 * Item de venta tal como viene de la base de datos
 * Usar solo para operaciones de lectura/escritura directas
 */
export type SaleItemDB = Tables<'sale_items'>

// ============================================================================
// TIPOS DE DOMINIO (normalizados para la aplicación)
// ============================================================================

/**
 * Venta normalizada para uso en la aplicación
 * - Campos numéricos convertidos a Money
 * - sale_number convertido a string para UI
 * - created_at garantizado no-null
 */
export type Sale = Omit<
  SaleDB,
  'total' | 'subtotal' | 'discount' | 'sale_number' | 'created_at'
> & {
  total: Money
  subtotal: Money
  discount: Money
  sale_number: string
  created_at: string
}

/**
 * Item de venta normalizado para uso en la aplicación
 * - Campos numéricos convertidos a Money
 */
export type SaleItem = Omit<
  SaleItemDB,
  'unit_price' | 'subtotal' | 'cost_price'
> & {
  unit_price: Money
  subtotal: Money
  cost_price: Money
}

// ============================================================================
// TIPOS DE RELACIONES (reflejan consultas Supabase reales)
// ============================================================================

/**
 * Item de venta con información del producto relacionado
 * Refleja la consulta:
 * ```sql
 * sale_items (*, products (id, name, sku, barcode))
 * ```
 */
export interface SaleItemWithProduct extends SaleItem {
  products: {
    id: string
    name: string
    sku: string | null
    barcode: string | null
  }
}

/**
 * Venta con todos los detalles y relaciones
 * Refleja la consulta completa:
 * ```sql
 * sales (
 *   *,
 *   sale_items (*, products (id, name, sku, barcode)),
 *   users (id, first_name, last_name),
 *   cash_registers (id, name)
 * )
 * ```
 */
export interface SaleWithDetails extends Sale {
  sale_items: SaleItemWithProduct[]
  users?: {
    id: string
    first_name: string
    last_name: string
  }
  cash_registers?: {
    id: string
    name: string
  }
}

/**
 * Alias para compatibilidad con código existente
 * @deprecated Usar SaleWithDetails en su lugar
 */
export type SaleWithRelations = SaleWithDetails

// ============================================================================
// TIPOS PARA PARÁMETROS DE CREACIÓN/ACTUALIZACIÓN
// ============================================================================

/**
 * Parámetros para crear una venta
 */
export type CreateSaleParams = Omit<
  Inserts<'sales'>,
  'id' | 'created_at' | 'sale_number'
>

/**
 * Parámetros para actualizar una venta
 */
export type UpdateSaleParams = Omit<
  Updates<'sales'>,
  'id' | 'tenant_id' | 'created_at'
>

/**
 * Parámetros para crear un item de venta
 */
export type CreateSaleItemParams = Omit<
  Inserts<'sale_items'>,
  'id'
>

// ============================================================================
// ESTADÍSTICAS Y FILTROS
// ============================================================================

/**
 * Estadísticas de ventas
 * Estructura devuelta por funciones RPC de Supabase
 */
export interface SalesStats {
  total_sales: Money
  sales_count: number
  average_ticket: Money
  most_used_payment_method: PaymentMethod
  sales_by_payment_method: {
    CASH: Money
    CARD: Money
    TRANSFER: Money
  }
}

/**
 * Filtros para consultas de ventas
 */
export interface SalesQueryFilters {
  tenant_id: string
  start_date?: string
  end_date?: string
  payment_method?: PaymentMethod
  user_id?: string
  search?: string
}

/**
 * Períodos de tiempo para filtrar ventas
 */
export type SalesPeriod = 'all' | 'today' | 'week' | 'month'

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

/**
 * Información básica de usuario para mostrar en ventas
 */
export interface SaleUser {
  id: string
  first_name: string
  last_name: string
}

/**
 * Información básica de caja registradora para mostrar en ventas
 */
export interface SaleCashRegister {
  id: string
  name: string
}

/**
 * Información básica de producto para mostrar en items de venta
 */
export interface SaleProduct {
  id: string
  name: string
  sku: string | null
  barcode: string | null
}
