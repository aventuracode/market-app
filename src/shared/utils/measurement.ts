/**
 * Utilidades para formateo de medidas y cantidades
 * Estandariza el formato para productos pesables y por unidad
 */

/**
 * Formatea un peso en kilogramos o gramos según corresponda
 * @param value - Valor numérico o string a formatear
 * @returns String formateado (ej: "250 g" o "1,5 kg")
 */
export function formatWeight(value: number | string): string {
  const amount = Number(value) || 0

  // Si es menos de 1 kg, mostrar en gramos
  if (amount < 1) {
    return `${Math.round(amount * 1000)} g`
  }

  // Si es 1 kg o más, mostrar en kilogramos
  return `${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} kg`
}

/**
 * Formatea una cantidad según el tipo de unidad
 * @param quantity - Cantidad a formatear
 * @param unitType - Tipo de unidad ('UNIT', 'KILOGRAM', 'GRAM', 'LITER', 'MILLILITER')
 * @returns String formateado según el tipo
 */
export function formatQuantity(
  quantity: number | string,
  unitType?: 'UNIT' | 'KILOGRAM' | 'GRAM' | 'LITER' | 'MILLILITER'
): string {
  const value = Number(quantity) || 0

  switch (unitType) {
    case 'KILOGRAM':
      return formatWeight(value)
    
    case 'GRAM':
      return `${Math.round(value)} g`
    
    case 'LITER':
      if (value < 1) {
        return `${Math.round(value * 1000)} ml`
      }
      return `${value.toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      })} l`
    
    case 'MILLILITER':
      return `${Math.round(value)} ml`
    
    case 'UNIT':
    default:
      // Para unidades, mostrar sin decimales
      return `${Math.floor(value)}`
  }
}

/**
 * Formatea el stock de un producto según su tipo de unidad
 * @param stock - Stock a formatear
 * @param unitType - Tipo de unidad del producto
 * @returns String formateado
 */
export function formatStock(
  stock: number | string,
  unitType?: 'UNIT' | 'KILOGRAM' | 'GRAM' | 'LITER' | 'MILLILITER'
): string {
  return formatQuantity(stock, unitType)
}
