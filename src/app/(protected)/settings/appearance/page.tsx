import { ThemeSwitcher } from '@/components/theme/theme-switcher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AppearancePage() {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Apariencia</h1>
        <p className="text-muted-foreground">
          Personaliza la apariencia de la aplicación
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>
            Selecciona el tema de la interfaz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paleta de Colores</CardTitle>
          <CardDescription>
            Colores del sistema POS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Primary</p>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-primary" />
                <span className="text-xs text-muted-foreground">Azul principal</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Success</p>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-success" />
                <span className="text-xs text-muted-foreground">Verde éxito</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Warning</p>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-warning" />
                <span className="text-xs text-muted-foreground">Amarillo alerta</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Destructive</p>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-destructive" />
                <span className="text-xs text-muted-foreground">Rojo error</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Componentes de Ejemplo</CardTitle>
          <CardDescription>
            Vista previa de componentes con el tema actual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm font-medium">Background Muted</p>
            <p className="text-xs text-muted-foreground">Texto secundario</p>
          </div>

          <div className="p-4 rounded-lg bg-card border">
            <p className="text-sm font-medium">Card Background</p>
            <p className="text-xs text-muted-foreground">Contenido de tarjeta</p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg bg-primary text-primary-foreground text-center text-sm font-medium">
              Primary
            </div>
            <div className="flex-1 p-3 rounded-lg bg-success text-success-foreground text-center text-sm font-medium">
              Success
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg bg-warning text-warning-foreground text-center text-sm font-medium">
              Warning
            </div>
            <div className="flex-1 p-3 rounded-lg bg-destructive text-destructive-foreground text-center text-sm font-medium">
              Error
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
