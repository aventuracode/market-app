import { AppShell } from '@/shared/ui/layout/app-shell'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // El middleware ya valida la autenticación y redirige si es necesario
  // No necesitamos verificar aquí para evitar delays innecesarios
  return <AppShell>{children}</AppShell>
}
