# Market POS

Sistema POS moderno y mobile-first para kioscos.

## Stack Tecnológico

- **Next.js 14** - App Router
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Zustand** - State management
- **Supabase** - Backend & Auth
- **PWA** - Progressive Web App

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
npm install
```

## Configuración

1. Copia `.env.local.example` a `.env.local`
2. Configura las variables de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Comandos

- `npm run dev` - Servidor desarrollo
- `npm run build` - Build producción
- `npm run start` - Servidor producción
- `npm run lint` - Linter
- `npm run format` - Formatear código

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

## Roadmap MVP

1. ✅ Setup inicial
2. 🔄 Auth & Layout
3. ⏳ POS & Cart
4. ⏳ Caja
5. ⏳ Productos
6. ⏳ Ventas

## Licencia

Privado
