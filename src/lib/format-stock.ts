import { UnitType, UNIT_TYPE_OPTIONS } from '@/features/products/domain/product'
import { formatStock as formatStockMeasurement } from '@/lib/utils/measurement'

/**
 * Formatea el stock con su unidad de medida
 * @param stock - Cantidad en stock
 * @param unitType - Tipo de unidad
 * @param allowDecimal - Si permite decimales (deprecated, se determina automáticamente)
 * @returns String formateado (ej: "80", "250 g", "1,5 kg")
 */
export function formatStock(
  stock: number,
  unitType: UnitType = 'UNIT',
  allowDecimal: boolean = false
): string {
  // Usar el helper centralizado de measurement.ts
  return formatStockMeasurement(stock, unitType)
}

/**
 * Obtiene la abreviación de una unidad
 * @param unitType - Tipo de unidad
 * @returns Abreviación (ej: "kg", "l", "un")
 */
export function getUnitAbbreviation(unitType: UnitType = 'UNIT'): string {
  const unit = UNIT_TYPE_OPTIONS.find(u => u.value === unitType)
  return unit?.abbreviation || 'un'
}

/**
 * Obtiene el label de una unidad
 * @param unitType - Tipo de unidad
 * @returns Label (ej: "Kilogramo", "Litro", "Unidad")
 */
export function getUnitLabel(unitType: UnitType = 'UNIT'): string {
  const unit = UNIT_TYPE_OPTIONS.find(u => u.value === unitType)
  return unit?.label || 'Unidad'
}
