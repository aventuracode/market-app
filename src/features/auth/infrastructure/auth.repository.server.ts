import { createClient } from '@/shared/supabase/server'

/**
 * AuthRepositoryServer
 * Responsable únicamente del acceso a Supabase desde contexto SERVER
 * (Server Actions, Route Handlers, Server Components).
 *
 * Usa createServerClient, que depende de cookies() por-request — por eso
 * el cliente NO se cachea como singleton a nivel de módulo ni de
 * constructor: se resuelve de nuevo en cada método, así siempre lee
 * las cookies de la request actual.
 *
 * Solo expone los métodos que efectivamente se invocan desde el server
 * (según auditoría de uso): signIn y signOut, consumidos desde
 * auth.actions.ts.
 */
export class AuthRepositoryServer {
  private async getClient() {
    return createClient()
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const supabase = await this.getClient()
    const { data, error } = await supabase.auth.signInWithPassword({
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
    const supabase = await this.getClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}

export const authRepositoryServer = new AuthRepositoryServer()
