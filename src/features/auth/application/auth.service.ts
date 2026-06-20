
import { mapUserProfile, mapTenant } from '../domain/auth.mapper'
import type { UserProfile, Tenant } from '../domain/auth.types'
import { authRepositoryClient } from '../infrastructure/auth.repository.client'

/**
 * Auth Service
 * Application layer - uses repository and applies mappers
 * Returns domain types
 *
 * Login y logout viven exclusivamente en las Server Actions
 * (loginAction / logoutAction → authRepositoryServer). Este service
 * es client-only y expone solo lectura de perfil/tenant/sesión y
 * gestión de password, que sí se invocan desde hooks ('use client').
 */
export class AuthService {
  /**
   * Sign up new user
   */
  async signUp(signUpData: {
    email: string
    password: string
    tenantId: string
    role?: string
    firstName?: string
    lastName?: string
  }) {
    const { user } = await authRepositoryClient.signUp(
      signUpData.email,
      signUpData.password
    )

    if (!user) throw new Error('User creation failed')

    const roleMap: Record<string, number> = {
      ADMIN: 1,
      CAJERO: 2,
      SUPERVISOR: 3,
    }

    const profile = await authRepositoryClient.createUserProfile({
      id: user.id,
      email: signUpData.email,
      tenant_id: signUpData.tenantId,
      role_id: signUpData.role ? roleMap[signUpData.role] : 2, // Default CAJERO
      first_name: signUpData.firstName,
      last_name: signUpData.lastName,
    })

    return mapUserProfile(profile, user.email || signUpData.email)
  }

  /**
   * Get current user profile (domain type)
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const authUser = await authRepositoryClient.getAuthUser()

    if (!authUser) return null

    const userProfile = await authRepositoryClient.getUserProfile(authUser.id)

    if (!userProfile) return null

    return mapUserProfile(userProfile, authUser.email || '')
  }

  /**
   * Get tenant by ID (domain type)
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    const tenant = await authRepositoryClient.getTenantById(tenantId)

    if (!tenant) return null

    return mapTenant(tenant)
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const redirectTo = `${window.location.origin}/auth/reset-password`
    await authRepositoryClient.resetPassword(email, redirectTo)
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    await authRepositoryClient.updatePassword(newPassword)
  }

  /**
   * Get current session
   */
  async getSession() {
    return await authRepositoryClient.getSession()
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return authRepositoryClient.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()