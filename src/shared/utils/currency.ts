/**
 * Utilidades para formateo de moneda y números
 * Estandariza el formato para Argentina (ARS)
 */

/**
 * Formatea un valor numérico como moneda argentina (ARS)
 * @param value - Valor numérico o string a formatear
 * @returns String formateado como moneda (ej: "$ 20.000")
 */
export function formatCurrency(value: number | string): string {
  const amount = Number(value) || 0

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea un valor numérico sin símbolo de moneda
 * @param value - Valor numérico o string a formatear
 * @returns String formateado como número (ej: "20.000")
 */
export function formatNumber(value: number | string): string {
  const amount = Number(value) || 0

  return new Intl.NumberFormat('es-AR').format(amount)
}
