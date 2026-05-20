import { requireAuth } from '@/lib/supabase/auth-helpers'
import { AppShell } from '@/components/layout/app-shell'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return <AppShell>{children}</AppShell>
}
