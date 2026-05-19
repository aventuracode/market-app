import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth-helpers'

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect('/pos')
  }

  redirect('/login')
}
