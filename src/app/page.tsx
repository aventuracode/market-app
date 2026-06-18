import { redirect } from 'next/navigation'
import { getSession } from '@/shared/supabase'

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect('/pos')
  }

  redirect('/login')
}
