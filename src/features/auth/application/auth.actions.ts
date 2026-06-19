'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { authRepository } from '../infrastructure/auth.repository'

/**
 * Server Action: Login
 * Autentica usuario y redirige a POS
 */
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await authRepository.signIn(email, password)
    
    revalidatePath('/', 'layout')
    redirect('/pos')
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Error al iniciar sesión' 
    }
  }
}

/**
 * Server Action: Logout
 * Cierra sesión y redirige a login
 */
export async function logoutAction() {
  try {
    await authRepository.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    // Redirigir de todas formas
    redirect('/login')
  }
}
