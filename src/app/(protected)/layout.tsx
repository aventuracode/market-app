import { requireAuth } from '@/lib/supabase/auth-helpers'
import { UserMenu } from '@/components/auth/user-menu'
import { BottomNav } from '@/components/navigation/bottom-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="flex flex-col h-screen">
      <UserMenu />
      <main className="flex-1 overflow-auto pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
