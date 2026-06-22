import { Inserts } from "@/shared/supabase/types"

export type SaleItemInput = {
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type CreateSaleInputParams = Omit<
  Inserts<'sales'>,
  'id' | 'created_at' | 'sale_number' | 'subtotal' | 'total' | 'tenant_id' | 'user_id'  // ✅ la RPC los calcula/obtiene de auth
> & {
  cash_register_id: string  // sobreescribe string | null
  cash_session_id: string   // sobreescribe string | null
  items: SaleItemInput[]
}