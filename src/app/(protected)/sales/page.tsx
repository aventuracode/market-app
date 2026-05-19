import { requireAuth } from '@/lib/supabase/auth-helpers'

export default async function SalesPage() {
  await requireAuth()

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Ventas</h1>
      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        <p>Feature Ventas en desarrollo</p>
      </div>
    </div>
  )
}
