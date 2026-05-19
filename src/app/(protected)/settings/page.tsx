import { requireRole } from '@/lib/supabase/auth-helpers'

export default async function SettingsPage() {
  const user = await requireRole(['ADMIN', 'SUPERVISOR'])

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Solo para ADMIN y SUPERVISOR
        </p>
      </div>
      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        <p>Feature Configuración en desarrollo</p>
        <p className="text-xs mt-2">Rol actual: {user.role}</p>
      </div>
    </div>
  )
}
