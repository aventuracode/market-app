/**
 * Colores semánticos del proyecto.
 *
 * RESTRICCIÓN TAILWIND: Las clases deben ser strings literales completos
 * para que el compilador las detecte en el escaneo estático.
 * NO construir clases dinámicamente (`"text-" + color`).
 * Usar: `SEMANTIC_COLORS.success.text` → evaluado como `'text-green-600'`.
 * Todas las clases aquí declaradas están en la safelist de tailwind.config.ts.
 *
 * Semántica:
 * - success (verde):   ventas en efectivo, caja abierta, estados exitosos
 * - card (azul):       ventas con tarjeta, información, botones principales
 * - transfer (púrpura): transferencias, pagos digitales, Mercado Pago
 * - warning (ámbar):   stock bajo, advertencias
 * - danger (rojo):     gastos, cancelaciones, caja cerrada, errores
 * - neutral (gris):    estados neutros, información secundaria
 */

export const SEMANTIC_COLORS = {
  success: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
  },
  card: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
  },
  transfer: {
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800',
  },
  warning: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
  },
  danger: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
  },
  neutral: {
    text: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
  },
} as const

export type SemanticColor = keyof typeof SEMANTIC_COLORS
