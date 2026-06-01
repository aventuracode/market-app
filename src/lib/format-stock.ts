import { UnitType, UNIT_TYPE_OPTIONS } from '@/types/product'

/**
 * Formatea el stock con su unidad de medida
 * @param stock - Cantidad en stock
 * @param unitType - Tipo de unidad
 * @param allowDecimal - Si permite decimales
 * @returns String formateado (ej: "80 un", "12.5 kg", "3 l")
 */
export function formatStock(
  stock: number,
  unitType: UnitType = 'UNIT',
  allowDecimal: boolean = false
): string {
  const unit = UNIT_TYPE_OPTIONS.find(u => u.value === unitType)
  const abbreviation = unit?.abbreviation || 'un'
  
  // Formatear número según si permite decimales
  const formattedNumber = allowDecimal 
    ? stock.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : Math.floor(stock).toLocaleString('es-CL')
  
  return `${formattedNumber} ${abbreviation}`
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
