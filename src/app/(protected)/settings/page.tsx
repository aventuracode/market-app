import { requireRole } from '@/lib/supabase/auth-helpers'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Bell, Shield, Store, User } from 'lucide-react'

export default async function SettingsPage() {
  const user = await requireRole(['ADMIN', 'SUPERVISOR'])

  const settingsSections = [
    {
      title: 'Apariencia',
      description: 'Tema, colores y personalización',
      icon: Palette,
      href: '/settings/appearance',
    },
    {
      title: 'Perfil',
      description: 'Información personal y cuenta',
      icon: User,
      href: '/settings/profile',
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
      title: 'Notificaciones',
      description: 'Alertas y avisos',
      icon: Bell,
      href: '/settings/notifications',
      soon: true,
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
          Rol actual: <span className="font-medium text-primary">{user.role}</span>
        </p>
      </div>

      <div className="grid gap-4">
        {settingsSections.map((section) => {
          const Icon = section.icon

          return (
            <Link
              key={section.href}
              href={section.soon ? '#' : section.href}
              className={section.soon ? 'pointer-events-none opacity-60' : ''}
            >
              <Card className="hover:bg-accent/50 transition-colors">
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
            </Link>
          )
        })}
      </div>
    </div>
  )
}
