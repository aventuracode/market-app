import { createClient } from '@/shared/supabase/client'
import type { UserDB, TenantDB } from '../domain/auth.types'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

/**
 * Auth Repository
 * Responsible for direct Supabase access only
 * Returns raw DB types
 */
export class AuthRepository {
  private supabase = createClient()

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    if (error) throw error
    return session
  }

  /**
   * Get current auth user
   */
  async getAuthUser(): Promise<SupabaseUser | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  /**
   * Get user profile from users table
   */
  async getUserProfile(userId: string): Promise<UserDB | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  }

  /**
   * Create user profile in users table
   */
  async createUserProfile(profile: {
    id: string
    email: string
    tenant_id: string
    role_id?: number
    first_name?: string
    last_name?: string
  }): Promise<UserDB> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(profile as never)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<TenantDB | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .maybeSingle()

    if (error) throw error
    return data
  }

  /**
   * Reset password
   */
  async resetPassword(email: string, redirectTo: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) throw error
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}

export const authRepository = new AuthRepository()
