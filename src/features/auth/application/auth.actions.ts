'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { authRepositoryServer } from '../infrastructure/auth.repository.server'

/**
 * Server Action: Login
 * Autentica usuario y redirige a POS
 */
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await authRepositoryServer.signIn(email, password)
    
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Error al iniciar sesión' 
    }
  }

    revalidatePath('/', 'layout')
    redirect('/pos')
}

/**
 * Server Action: Logout
 * Cierra sesión y redirige a login
 */
export async function logoutAction() {
  try {
    await authRepositoryServer.signOut()
    
  } catch (error) {
    // Redirigir de todas formas
    redirect('/login')
  }
  revalidatePath('/', 'layout')
    redirect('/login')
}
