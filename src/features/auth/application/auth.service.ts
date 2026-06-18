import { authRepository } from '../infrastructure/auth.repository'
import { mapUserProfile, mapTenant } from '../domain/auth.mapper'
import type { UserProfile, Tenant, LoginCredentials, SignUpData } from '../domain/auth.types'

/**
 * Auth Service
 * Application layer - uses repository and applies mappers
 * Returns domain types
 */
export class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials) {
    const { user, session } = await authRepository.signIn(
      credentials.email,
      credentials.password
    )

    if (!user) throw new Error('Login failed')

    // Get user profile
    const userProfile = await this.getCurrentUserProfile()
    
    return {
      user: userProfile,
      session,
    }
  }

  /**
   * Logout user
   */
  async logout() {
    await authRepository.signOut()
  }

  /**
   * Sign up new user
   */
  async signUp(signUpData: SignUpData) {
    const { user } = await authRepository.signUp(
      signUpData.email,
      signUpData.password
    )

    if (!user) throw new Error('User creation failed')

    // Create user profile
    const roleMap: Record<string, number> = {
      'ADMIN': 1,
      'CAJERO': 2,
      'SUPERVISOR': 3,
    }

    const profile = await authRepository.createUserProfile({
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
    const authUser = await authRepository.getAuthUser()
    
    if (!authUser) return null

    const userProfile = await authRepository.getUserProfile(authUser.id)
    
    if (!userProfile) return null

    return mapUserProfile(userProfile, authUser.email || '')
  }

  /**
   * Get tenant by ID (domain type)
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    const tenant = await authRepository.getTenantById(tenantId)
    
    if (!tenant) return null

    return mapTenant(tenant)
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const redirectTo = `${window.location.origin}/auth/reset-password`
    await authRepository.resetPassword(email, redirectTo)
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    await authRepository.updatePassword(newPassword)
  }

  /**
   * Get current session
   */
  async getSession() {
    return await authRepository.getSession()
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return authRepository.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()
