import { requireAuth } from '@/lib/supabase/auth-helpers'

export default async function POSPage() {
  const user = await requireAuth()

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Punto de Venta</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user.email}
        </p>
      </div>

      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        <p>Feature POS en desarrollo</p>
      </div>
    </div>
  )
}
