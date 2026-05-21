import { requireAuth } from '@/lib/supabase/auth-helpers'

export default async function POSPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Punto de Venta</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user.email}
          </p>
        </div>
      </div>

      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        <p>Feature POS en desarrollo</p>
      </div>
    </div>
  )
}
