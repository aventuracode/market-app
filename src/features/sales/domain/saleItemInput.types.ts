import { Inserts } from "@/lib/supabase/client"
import { string } from "zod"

export type SaleItemInput = {
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type CreateSaleInputParams = Omit<
  Inserts<'sales'>,
  'id' | 'created_at' | 'sale_number' | 'subtotal' | 'total'  // ✅ la RPC los calcula
> & {
  cash_register_id: string  // sobreescribe string | null
  cash_session_id: string   // sobreescribe string | null
  items: SaleItemInput[]
}