export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { updateSession } from './middleware'

export {
  getCurrentUser,
  getCurrentTenantId,
  requireAuth,
  requireRole,
  getSession,
  isAuthenticated,
} from './auth-helpers'

export {
  getCurrentTenant,
  requireTenant,
  getTenantById,
  withTenantIsolation,
} from './tenant-helpers'
