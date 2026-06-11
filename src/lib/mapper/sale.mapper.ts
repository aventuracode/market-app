// src/lib/mappers/sale.mapper.ts
import { money } from '@/lib/money'
import type { SaleDB, SaleItemDB, SaleWithDetails, SaleItemWithProduct } from '@/types/sales'

type RawSaleItem = SaleItemDB & {
  products: {
    id: string
    name: string
    sku: string | null
    barcode: string | null
  } | null
}

type RawSaleWithDetails = SaleDB & {
  sale_items: RawSaleItem[]
  users: { id: string; first_name: string; last_name: string } | null
  cash_registers: { id: string; name: string } | null
}

function mapSaleItem(item: RawSaleItem): SaleItemWithProduct {
  return {
    ...item,
    unit_price: money(item.unit_price),
    subtotal: money(item.subtotal),
    cost_price: money(item.cost_price),
    products: item.products ?? { id: '', name: 'Producto eliminado', sku: null, barcode: null },
  }
}

export function mapSale(raw: RawSaleWithDetails): SaleWithDetails {
  return {
    ...raw,
    total: money(raw.total),
    subtotal: money(raw.subtotal),
    discount: money(raw.discount ?? 0),
    sale_number: String(raw.sale_number),
    created_at: raw.created_at ?? new Date().toISOString(),
    sale_items: raw.sale_items.map(mapSaleItem),
    users: raw.users ?? undefined,
    cash_registers: raw.cash_registers ?? undefined,
  }
}

export function mapSales(raws: RawSaleWithDetails[]): SaleWithDetails[] {
  return raws.map(mapSale)
}