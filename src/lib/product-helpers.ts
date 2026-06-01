import type { Product, ProductWithCategory, UnitType } from '@/types/product'
import { roundWeight, formatWeight } from '@/lib/utils/weight'

/**
 * Constante para incremento/decremento de peso
 */
export const STEP_WEIGHT = 0.100

/**
 * Constante para cantidad inicial de productos pesables
 */
export const DEFAULT_WEIGHT_QUANTITY = 0.100

/**
 * Formatea un precio en formato chileno
 * @param price - Precio a formatear
 * @returns Precio formateado
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Incrementa el peso en 0.100 kg
 * @param quantity - Cantidad actual
 * @returns Nueva cantidad incrementada
 */
export function incrementWeight(quantity: number): number {
  const newQuantity = quantity + STEP_WEIGHT
  return roundWeight(newQuantity)
}

/**
 * Decrementa el peso en 0.100 kg
 * @param quantity - Cantidad actual
 * @returns Nueva cantidad decrementada (mínimo 0.100)
 */
export function decrementWeight(quantity: number): number {
  const newQuantity = Math.max(STEP_WEIGHT, quantity - STEP_WEIGHT)
  return roundWeight(newQuantity)
}

/**
 * Obtiene la cantidad inicial apropiada para un producto
 * @param product - Producto
 * @returns 1 para productos UNIT, 0.100 para productos pesables (KILOGRAM, etc)
 */
export function getInitialQuantity(product: Product | ProductWithCategory): number {
  const unitType = product.unit_type || 'UNIT'
  
  // Productos pesables inician con 0.100 kg/l/g/ml
  if (unitType === 'KILOGRAM' || unitType === 'GRAM' || unitType === 'LITER' || unitType === 'MILLILITER') {
    return DEFAULT_WEIGHT_QUANTITY
  }
  
  // Productos UNIT inician con 1
  return 1
}

/**
 * Verifica si un producto permite cantidades decimales
 * @param product - Producto a verificar
 * @returns true si el producto permite decimales
 */
export function isDecimalProduct(product: Product | ProductWithCategory): boolean {
  return product.allow_decimal === true
}

/**
 * Obtiene el incremento/decremento apropiado para un producto
 * @param product - Producto
 * @returns 1 para productos UNIT, 0.250 para productos decimales
 */
export function getProductStep(product: Product | ProductWithCategory): number {
  return isDecimalProduct(product) ? 0.250 : 1
}

/**
 * Formatea la cantidad según el tipo de producto con unidades
 * @param quantity - Cantidad a formatear
 * @param product - Producto
 * @param showUnit - Si debe mostrar la unidad (default: true)
 * @returns Cantidad formateada con unidad
 */
export function formatQuantity(
  quantity: number, 
  product: Product | ProductWithCategory,
  showUnit: boolean = true
): string {
  // Redondear para evitar problemas de floating point
  const roundedQuantity = roundWeight(quantity)
  const unitType = product.unit_type || 'UNIT'
  
  // GRAM: mostrar en gramos
  if (unitType === 'GRAM') {
    const formatted = Math.round(roundedQuantity)
    return showUnit ? `${formatted} g` : formatted.toString()
  }
  
  // KILOGRAM: convertir a gramos si es menos de 1kg
  if (unitType === 'KILOGRAM') {
    if (roundedQuantity < 1) {
      const grams = Math.round(roundedQuantity * 1000)
      return showUnit ? `${grams} g` : grams.toString()
    }
    const formatted = formatWeight(roundedQuantity)
    return showUnit ? `${formatted} kg` : formatted
  }
  
  // LITER: mostrar en litros con decimales
  if (unitType === 'LITER') {
    const formatted = formatWeight(roundedQuantity)
    return showUnit ? `${formatted} l` : formatted
  }
  
  // MILLILITER: mostrar en mililitros
  if (unitType === 'MILLILITER') {
    const formatted = Math.round(roundedQuantity)
    return showUnit ? `${formatted} ml` : formatted.toString()
  }
  
  // UNIT: sin decimales
  const formatted = Math.floor(roundedQuantity)
  return showUnit ? `${formatted} un` : formatted.toString()
}

/**
 * Formatea la unidad de medida para mostrar en badges
 * @param unitType - Tipo de unidad
 * @returns Label corto para badge
 */
export function formatUnit(unitType: UnitType = 'UNIT'): string {
  const labels: Record<UnitType, string> = {
    UNIT: 'Unidad',
    GRAM: 'Gramos',
    KILOGRAM: 'Kg',
    LITER: 'Litros',
    MILLILITER: 'Ml'
  }
  return labels[unitType] || 'Unidad'
}

/**
 * Obtiene la variante de color para el badge de unidad
 * @param unitType - Tipo de unidad
 * @returns Clases de Tailwind para el badge
 */
export function getUnitBadgeVariant(unitType: UnitType = 'UNIT'): string {
  const variants: Record<UnitType, string> = {
    UNIT: 'bg-slate-100 text-slate-700 border-slate-200',
    GRAM: 'bg-blue-50 text-blue-700 border-blue-200',
    KILOGRAM: 'bg-blue-50 text-blue-700 border-blue-200',
    LITER: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    MILLILITER: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  }
  return variants[unitType] || variants.UNIT
}

/**
 * Formatea el precio con su unidad de medida
 * @param price - Precio del producto
 * @param unitType - Tipo de unidad
 * @returns Precio formateado con unidad (ej: "$18.000 / kg")
 */
export function formatPriceByUnit(price: number, unitType: UnitType = 'UNIT'): string {
  const formattedPrice = formatPrice(price)
  
  const unitLabels: Record<UnitType, string> = {
    UNIT: 'un',
    GRAM: '100g',
    KILOGRAM: 'kg',
    LITER: 'l',
    MILLILITER: '100ml'
  }
  
  const unit = unitLabels[unitType] || 'un'
  return `${formattedPrice} / ${unit}`
}
