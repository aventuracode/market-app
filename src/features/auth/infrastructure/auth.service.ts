import { createClient } from '@/lib/supabase/client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData extends LoginCredentials {
  tenantId: string
  role?: 'ADMIN' | 'CAJERO' | 'SUPERVISOR'
}

export class AuthService {
  private supabase = createClient()

  async login(credentials: LoginCredentials) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  async signUp(signUpData: SignUpData) {
    const { data: authData, error: authError } =
      await this.supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
      })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('User creation failed')
    }

    const { error: userError } = await this.supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: signUpData.email,
        tenant_id: signUpData.tenantId,
        role: signUpData.role || 'CAJERO',
      } as never)

    if (userError) {
      throw new Error(userError.message)
    }

    return authData
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async getSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession()
    return session
  }

  async getUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    return user
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()
