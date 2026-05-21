# Market POS

Sistema POS moderno y mobile-first para kioscos.

## Stack Tecnológico

### Frontend
- **Next.js 14.2.3** - App Router con Server Components
- **React 18.3.1** - UI library
- **TypeScript 5.4.5** - Tipado estático
- **TailwindCSS 3.4.3** - Utility-first CSS
- **shadcn/ui** - Componentes UI accesibles
- **Lucide React** - Iconos modernos

### Backend & Auth
- **Supabase** - Backend as a Service
  - `@supabase/ssr 0.10.3` - SSR con Next.js 14
  - `@supabase/supabase-js 2.106.0` - Cliente JavaScript
- **Server Actions** - Mutaciones server-side
- **Middleware** - Protección de rutas

### State Management
- **Zustand 4.5.2** - State management ligero
- **React Hook Form 7.76.0** - Manejo de formularios
- **Zod 4.4.3** - Validación de schemas

### Theming
- **next-themes 0.3.0** - Sistema de temas
- **CSS Variables** - Theming dinámico
- **Dark mode** - Soporte completo

### Developer Experience
- **ESLint** - Linting
- **Prettier** - Formateo de código
- **TypeScript** - Type safety completo

## Estructura del Proyecto

```
src/
├── app/              # Next.js App Router
├── features/         # Features modulares
├── components/       # Componentes reutilizables
├── providers/        # Context providers
├── services/         # Servicios API
├── stores/           # Zustand stores
├── hooks/            # Custom hooks
├── lib/              # Utilidades
├── types/            # TypeScript types
└── styles/           # Estilos globales
```

## Instalación

```bash
pnpm install
```

## Configuración

1. Copia `.env.local.example` a `.env.local`
2. Configura las variables de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Obtén las credenciales:
   - Ve a [Supabase Dashboard](https://app.supabase.com)
   - Settings → API
   - Copia `Project URL` y `anon/public key`

## Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Comandos

- `pnpm dev` - Servidor desarrollo
- `pnpm build` - Build producción
- `pnpm start` - Servidor producción
- `pnpm lint` - Linter
- `pnpm format` - Formatear código

## Arquitectura

### Feature-based

Cada feature contiene:
- `components/` - Componentes específicos
- `hooks/` - Hooks específicos
- `services/` - Servicios API
- `stores/` - Stores Zustand
- `types/` - Types TypeScript

### Stores Zustand

- `cart.store.ts` - Carrito de compras
- `auth.store.ts` - Autenticación
- `cash-register.store.ts` - Caja activa

### Mobile-First

- Diseño táctil
- 100dvh viewport
- Safe areas iOS/Android
- Bottom navigation
- Dark mode

---

## 📐 Convenciones de Código

### Naming
- **Componentes:** `PascalCase.tsx`
- **Hooks:** `use*.ts`
- **Stores:** `*.store.ts`
- **Services:** `*.service.ts`
- **Types:** `PascalCase`

### Imports
```typescript
import { Component } from '@/components/Component'
import { useStore } from '@/stores/store'
import { service } from '@/services/service'
import type { Type } from '@/types'
```

### Componentes
- Mobile-first design
- Dark mode compatible
- TypeScript strict mode
- Props completamente tipadas
- Accesibilidad (a11y)

## Autenticación SSR con Supabase

✅ **Sistema Completo y Actualizado**

- **Next.js 14 App Router** con Server Components
- **Supabase SSR** (`@supabase/ssr` v0.10.3)
- **Server Actions** para login/logout
- **Middleware** de protección de rutas
- **Cookies HTTP-only** seguras
- **Multi-tenant** con tenant isolation
- **Role-based access control**
- Session persistence automática

### Características:
- ✅ Login con Server Actions
- ✅ Logout con Server Actions
- ✅ Protected routes con middleware
- ✅ Tenant isolation automático
- ✅ User menu con información de tenant
- ✅ Loading states y error handling
- ✅ TypeScript completo

Ver documentación:
- 📖 `SKILL_NEXTJS_SUPABASE_SSR_AUTH.md` - Guía completa de autenticación SSR

## Sistema de Theming

✅ **Theming Profesional**

- Light mode minimalista
- Dark mode moderno
- System preference detection
- Persistencia automática
- Paleta inspirada en Mercado Pago/Shopify
- Colores: Primary (azul), Success (verde), Warning (amarillo), Destructive (rojo)
- Theme toggle en UserMenu
- Página de configuración de apariencia

Ver documentación:
- 📖 `THEMING.md` - Guía completa de theming

## Layout Mobile-First

✅ **Layout Profesional**

- AppShell con estructura flex
- Header sticky con backdrop blur
- Bottom navigation táctil (5 secciones)
- Safe areas iOS/Android
- 100dvh support
- PageContainer reutilizable
- Touch optimizations (44px mínimo)
- Responsive con max-width
- PWA ready

Ver documentación:
- 📖 `LAYOUT.md` - Guía completa de layout

## Roadmap MVP

1. ✅ Setup inicial
2. ✅ Supabase multi-tenant
3. ✅ Auth & Layout mobile-first
4. ✅ Sistema de theming profesional
5. ✅ Layout mobile-first optimizado
6. 🔄 POS & Cart
7. ⏳ Caja
8. ⏳ Productos
9. ⏳ Ventas

## Documentación

### Documentos Principales
- 📖 `README.md` - Este archivo (overview del proyecto)
- 📖 `SKILL_NEXTJS_SUPABASE_SSR_AUTH.md` - Guía completa de autenticación SSR
- 📖 `THEMING.md` - Sistema de theming profesional

### Skills Reutilizables
Las skills son guías completas y reutilizables para implementar features específicas en otros proyectos:
- 🎓 `SKILL_NEXTJS_SUPABASE_SSR_AUTH.md` - Autenticación SSR con Next.js 14 + Supabase

## Licencia

MIT
