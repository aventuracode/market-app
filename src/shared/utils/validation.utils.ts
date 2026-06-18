import { ZodError, type ZodSchema } from 'zod'

/**
 * Resultado de validación
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> }

/**
 * Valida datos con un schema de Zod
 * @param schema - Schema de Zod
 * @param data - Datos a validar
 * @returns Resultado de validación con datos o errores
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string[]> = {}
      
      error.issues.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      
      return { success: false, errors }
    }
    
    // Error inesperado
    throw error
  }
}

/**
 * Valida datos de forma asíncrona
 * @param schema - Schema de Zod
 * @param data - Datos a validar
 * @returns Promise con resultado de validación
 */
export async function validateAsync<T>(
  schema: ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const validated = await schema.parseAsync(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string[]> = {}
      
      error.issues.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      
      return { success: false, errors }
    }
    
    // Error inesperado
    throw error
  }
}

/**
 * Formatea errores de Zod para mostrar en UI
 * @param errors - Errores de validación
 * @returns String con todos los errores formateados
 */
export function formatValidationErrors(
  errors: Record<string, string[]>
): string {
  return Object.entries(errors)
    .map(([field, messages]) => {
      const fieldName = field.split('.').pop() || field
      return `${fieldName}: ${messages.join(', ')}`
    })
    .join('\n')
}

/**
 * Obtiene el primer error de un campo específico
 * @param errors - Errores de validación
 * @param field - Nombre del campo
 * @returns Primer mensaje de error o undefined
 */
export function getFieldError(
  errors: Record<string, string[]>,
  field: string
): string | undefined {
  return errors[field]?.[0]
}

/**
 * Verifica si un campo tiene errores
 * @param errors - Errores de validación
 * @param field - Nombre del campo
 * @returns true si el campo tiene errores
 */
export function hasFieldError(
  errors: Record<string, string[]>,
  field: string
): boolean {
  return !!errors[field] && errors[field].length > 0
}

/**
 * Safe parse que retorna null en caso de error
 * Útil para validaciones opcionales
 */
export function safeParse<T>(
  schema: ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data)
  return result.success ? result.data : null
}
