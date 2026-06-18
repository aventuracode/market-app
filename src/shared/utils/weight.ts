/**
 * Utilidades para manejo de precisión decimal en productos pesables
 */

/**
 * Redondea un valor de peso a 3 decimales para evitar problemas de precisión
 * @param value - Valor a redondear
 * @returns Valor redondeado a 3 decimales
 * @example
 * roundWeight(0.1 + 0.2) // 0.3 (no 0.30000000000000004)
 * roundWeight(0.79999999) // 0.8
 */
export const roundWeight = (value: number): number => {
  return Math.round(value * 1000) / 1000
}

/**
 * Formatea un valor de peso eliminando ceros innecesarios
 * @param value - Valor a formatear
 * @returns String formateado sin ceros innecesarios
 * @example
 * formatWeight(0.800) // "0.8"
 * formatWeight(0.250) // "0.25"
 * formatWeight(1.000) // "1"
 * formatWeight(1.250) // "1.25"
 */
export const formatWeight = (value: number): string => {
  return Number(value.toFixed(3)).toString()
}
