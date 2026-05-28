/**
 * Formatea un número como moneda ARS
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea una fecha de forma relativa
 */
export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Hace un momento'
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
  
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(targetDate)
}

/**
 * Formatea una fecha y hora
 */
export function formatDateTime(date: string | Date): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(targetDate)
}

/**
 * Formatea solo la hora
 */
export function formatTime(date: string | Date): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(targetDate)
}
