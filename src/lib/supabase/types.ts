/**
 * Supabase Type Helpers
 * Única fuente de verdad para helpers de tipos de Supabase
 */
import type { Database } from '@/types/supabase.generated'

/**
 * Helper para obtener el tipo Row de una tabla
 * @example Tables<'products'> → ProductRow
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

/**
 * Helper para obtener el tipo Insert de una tabla
 * @example Inserts<'products'> → ProductInsert
 */
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

/**
 * Helper para obtener el tipo Update de una tabla
 * @example Updates<'products'> → ProductUpdate
 */
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

/**
 * Helper para obtener un enum de Supabase
 * @example Enums<'payment_method'> → 'CASH' | 'CARD' | 'TRANSFER'
 */
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

/**
 * Helper para obtener el tipo de argumentos de una función RPC
 * @example FunctionArgs<'create_sale'> → CreateSaleArgs
 */
export type FunctionArgs<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]['Args']

/**
 * Helper para obtener el tipo de retorno de una función RPC
 * @example FunctionReturns<'create_sale'> → CreateSaleReturn
 */
export type FunctionReturns<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]['Returns']
