// ─── use-checkout-items.ts ──────────────────────────────────────────────────
// SRP: único responsable de preparar y validar los items de la venta

import { useCallback } from 'react'
import { money, validateCheckoutTotal } from '@/lib/money'
import { SaleItemInput } from '@/features/sales/domain/saleItemInput.types'
import { CartItem } from '@/features/checkout/domain/cart.types'

const UNIT_LABELS: Record<string, string> = {
  UNIT: 'un',
  KILOGRAM: 'kg',
  GRAM: 'g',
  LITER: 'l',
  MILLILITER: 'ml',
}

export function useCheckoutItems(items: CartItem[]) {
  // Devuelve los mensajes de error de stock, array vacío si todo ok
  const assertStockAvailability = useCallback((): string[] => {
    return items
      .filter((item) => item.quantity > item.product.stock)
      .map((item) => {
        const label = UNIT_LABELS[item.product.unit_type] ?? item.product.unit_type
        return `${item.product.name}: disponible ${item.product.stock} ${label}`
      })
  }, [items])

  // Sanitiza y calcula los items listos para enviar a la RPC
  const buildSaleItems = useCallback((): SaleItemInput[] => {
    const saleItems = items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: money(item.product.sale_price),
      subtotal: money(money(item.product.sale_price) * item.quantity),
    }))

    // Validación de total como efecto secundario del build
    const total = saleItems.reduce((sum, item) => sum + money(item.subtotal), 0)
    validateCheckoutTotal(total)

    return saleItems
  }, [items])

  return { assertStockAvailability, buildSaleItems }
}