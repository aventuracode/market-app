import { z } from 'zod'
import type { Enums } from '@/lib/supabase/types'

export type StockMovementType = Enums<'stock_movement_type'>

export interface StockMovement {
  id: string
  tenant_id: string
  product_id: string
  type: StockMovementType
  quantity: number
  previous_stock: number
  new_stock: number
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface StockMovementWithProduct extends StockMovement {
  product: {
    id: string
    name: string
    barcode: string | null
    sku: string | null
  }
}

export interface StockMovementWithUser extends StockMovement {
  user: {
    id: string
    first_name: string
    last_name: string
  } | null
}

export interface StockMovementFull extends StockMovement {
  product: {
    id: string
    name: string
    barcode: string | null
    sku: string | null
  }
  user: {
    id: string
    first_name: string
    last_name: string
  } | null
}

// Stock Adjustment Form
// Stock Adjustment Form
export const stockAdjustmentSchema = z.object({
  reason: z.enum([
    'adjustment',
    'damage',
    'return',
    'transfer',
  ]),
  quantity: z
    .number()
    .min(1, 'La cantidad debe ser mayor a 0')
    .max(999999, 'La cantidad es demasiado grande'),
  operation: z.enum(['increase', 'decrease']),
  notes: z
    .string()
    .min(3, 'El motivo debe tener al menos 3 caracteres')
    .max(500, 'El motivo no puede tener más de 500 caracteres'),
})

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>

export interface CreateStockMovementData {
  tenant_id: string
  product_id: string
  type: StockMovementType
  quantity: number
  previous_stock: number
  new_stock: number
  reference_id?: string | null
  notes?: string | null
  created_by?: string | null
}

export interface StockMovementFilters {
  product_id?: string
  type?: StockMovementType
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface StockSummary {
  product_id: string
  current_stock: number
  total_purchases: number
  total_sales: number
  total_adjustments: number
  total_damages: number
  last_movement_date: string | null
}

// Movement type labels
export const STOCK_MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  IN: 'Entrada',
  OUT: 'Salida',
  ADJUSTMENT: 'Ajuste',
}
export const STOCK_MOVEMENT_TYPE_COLORS: Record<StockMovementType, string> = {
  IN: 'text-green-600 bg-green-50',
  OUT: 'text-red-600 bg-red-50',
  ADJUSTMENT: 'text-purple-600 bg-purple-50',
}
