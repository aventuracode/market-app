import { requireAuth } from '@/shared/supabase'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Shield, Store, Users, Tags } from 'lucide-react'

export default async function SettingsPage() {
  const user = await requireAuth()
  
  // Verificar si el usuario tiene permisos (role_id 1 = ADMIN, 2 = SUPERVISOR)
  const hasPermission = user.role_id && [1, 2].includes(user.role_id)
  
  if (!hasPermission) {
    // Redirigir a POS si no tiene permisos
    redirect('/pos')
  }

  const settingsSections = [
    {
      title: 'Categorías',
      description: 'Administra las categorías de productos',
      icon: Tags,
      href: '/settings/categories',
      soon: false,
    },
    {
      title: 'Usuarios',
      description: 'Gestiona usuarios y permisos',
      icon: Users,
      href: '/settings/users',
      soon: true,
    },
    {
      title: 'Comercio',
      description: 'Datos del negocio',
      icon: Store,
      href: '/settings/business',
      soon: true,
    },
    {
      title: 'Apariencia',
      description: 'Tema, colores y personalización',
      icon: Palette,
      href: '/settings/appearance',
      soon: false,
    },
    {
      title: 'Seguridad',
      description: 'Contraseña y accesos',
      icon: Shield,
      href: '/settings/security',
      soon: true,
    },
  ]

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona la configuración de tu cuenta y comercio
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Rol actual: <span className="font-medium text-primary">
            {user.role_id === 1 ? 'Administrador' : user.role_id === 2 ? 'Supervisor' : 'Empleado'}
          </span>
        </p>
      </div>

      <div className="grid gap-4">
        {settingsSections.map((section) => {
          const Icon = section.icon
          const cardContent = (
            <Card className={section.soon ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent/50 transition-colors'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  {section.soon && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Próximamente
                    </span>
                  )}
                </div>
              </CardHeader>
            </Card>
          )

          if (section.soon) {
            return <div key={section.href}>{cardContent}</div>
          }

          return (
            <Link key={section.href} href={section.href}>
              {cardContent}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
