'use client'

import { ThemeProvider } from './theme-provider'
import { AuthProvider } from '../../features/auth/ui/auth-provider'
import { QueryProvider } from './query-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
