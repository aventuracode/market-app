import { requireAuth } from '@/lib/supabase/auth-helpers'
import { PageContainer } from '@/components/layout/page-container'

export default async function POSPage() {
  const user = await requireAuth()

  return (
    <PageContainer
      title="Punto de Venta"
      description={`Bienvenido, ${user.email}`}
    >
      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        <p>Feature POS en desarrollo</p>
      </div>
    </PageContainer>
  )
}
