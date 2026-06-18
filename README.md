# 🏪 Market POS

> Sistema POS moderno, mobile-first y multi-tenant para kioscos y pequeños comercios.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación Rápida](#-instalación-rápida)
- [Arquitectura](#-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Desarrollo](#-desarrollo)

---

## ✨ Características

### 🛒 **Punto de Venta (POS)**
- ✅ Búsqueda rápida de productos
- ✅ Escaneo de códigos de barras (ZXing)
- ✅ Carrito de compras con persistencia
- ✅ Múltiples métodos de pago (Efectivo, Tarjeta, Transferencia)
- ✅ Checkout optimizado para móvil
- ✅ Actualización automática de stock

### 💰 **Gestión de Caja**
- ✅ Apertura/cierre de sesiones de caja
- ✅ Registro de movimientos (ventas, ingresos, egresos)
- ✅ Cálculo automático de saldo
- ✅ Actualización en tiempo real (Supabase Realtime)
- ✅ Historial de movimientos
- ✅ Validación de sesión activa

### 📦 **Gestión de Productos**
- ✅ CRUD completo de productos
- ✅ Categorización
- ✅ Control de stock
- ✅ Precios de compra y venta
- ✅ Imágenes de productos
- ✅ Búsqueda y filtros

### 📊 **Reportes y Ventas**
- ✅ Historial de ventas con filtros avanzados
- ✅ Estadísticas de caja en tiempo real
- ✅ Movimientos de stock automáticos
- ✅ Filtros por fecha, período y método de pago
- ✅ Separación de ventas por sesión de caja
- ✅ Resumen de ventas por método de pago

### ⚖️ **Productos Pesables**
- ✅ Soporte para kg, g, L, ml
- ✅ Incrementos decimales configurables
- ✅ Validación de cantidades decimales
- ✅ Input optimizado para productos pesables

### 🔐 **Seguridad y Multi-tenancy**
- ✅ Autenticación SSR con Supabase
- ✅ Row Level Security (RLS)
- ✅ Aislamiento por tenant
- ✅ Control de acceso basado en roles
- ✅ Sesiones seguras con cookies HTTP-only

### 🎨 **UX/UI**
- ✅ Diseño mobile-first
- ✅ Dark mode / Light mode
- ✅ Animaciones con Framer Motion
- ✅ Componentes accesibles (shadcn/ui)
- ✅ Optimizado para pantallas táctiles
- ✅ PWA ready

---

## 🛠️ Stack Tecnológico

### **Frontend**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 15.5.18 | Framework React con App Router |
| React | 19 | UI Library |
| TypeScript | 5.4.5 | Type Safety |
| TailwindCSS | 3.4.3 | Utility-first CSS |
| shadcn/ui | - | Componentes UI accesibles (Radix UI) |
| Framer Motion | 11.2.10 | Animaciones |
| Lucide React | 0.379.0 | Iconos |
| ZXing | 0.22.0 | Barcode Scanner |
| React Currency Input | 4.0.5 | Input de moneda |

### **Backend & Database**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Supabase | - | Backend as a Service |
| @supabase/ssr | 0.10.3 | SSR con Next.js 14 |
| @supabase/supabase-js | 2.106.0 | Cliente JavaScript |
| PostgreSQL | - | Base de datos relacional |

### **State Management & Data Fetching**
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Zustand | 4.5.2 | State management global |
| TanStack Query | 5.100.14 | Server state & caching |
| React Hook Form | 7.76.0 | Manejo de formularios |
| Zod | 4.4.3 | Validación de schemas |
| date-fns | 4.3.0 | Manipulación de fechas |

### **Developer Tools**
- **pnpm** 10.33.3 - Package manager (requerido)
- **ESLint** 9.22.0 - Linting
- **Prettier** 3.2.5 - Formateo de código
- **TypeScript** 5.4.5 - Type checking
- **TanStack Query DevTools** - Debugging de queries

---

## 📦 Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/market-app.git
cd market-app

# Instalar dependencias (requiere pnpm 10.33.3+)
pnpm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar desarrollo
pnpm dev
```

**Prerrequisitos:** Node.js 20+, pnpm 10.33.3+, cuenta de Supabase

---

## 🏗️ Arquitectura

### **Feature First Architecture**

El proyecto sigue una arquitectura modular basada en features, donde cada feature es autónoma y contiene:

```
features/
  ├── auth/           # Autenticación y autorización
  ├── cash/           # Gestión de caja
  ├── checkout/       # Proceso de checkout
  ├── products/       # Catálogo de productos
  ├── sales/          # Historial de ventas
  └── pos/            # Punto de venta
```

Cada feature se organiza en capas:

- **`domain/`** - Tipos, schemas, validaciones, mappers
- **`application/`** - Hooks, stores, lógica de negocio
- **`infrastructure/`** - Servicios, API calls, integraciones
- **`ui/`** - Componentes React específicos del feature

### **Principios Clave**

- ✅ **Separation of Concerns:** Cada capa tiene responsabilidades claras
- ✅ **Type Safety:** Tipos derivados de Supabase + normalizaciones de dominio
- ✅ **Domain Mappers:** Conversión centralizada de DB types → Domain types
- ✅ **Money Type:** Tipo seguro para valores financieros (previene NaN)
- ✅ **Single Source of Truth:** Helpers de Supabase centralizados en `/lib/supabase/types.ts`

---

## 📁 Estructura del Proyecto

```
market-app/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                 # Rutas públicas
│   │   ├── (protected)/            # Rutas protegidas
│   │   └── login/
│   │
│   ├── features/                    # 🎯 Feature First Architecture
│   │   ├── auth/
│   │   │   ├── domain/             # Tipos, validaciones
│   │   │   ├── application/        # Hooks, stores (auth.store, use-auth, use-tenant)
│   │   │   ├── infrastructure/     # auth.service.ts
│   │   │   └── ui/                 # Componentes de login
│   │   │
│   │   ├── products/
│   │   │   ├── domain/             # product.ts, category.ts, *.mapper.ts, schemas
│   │   │   ├── application/        # use-products, use-categories, queries/
│   │   │   ├── infrastructure/     # product.service, category.service
│   │   │   └── ui/                 # Componentes de productos
│   │   │
│   │   ├── sales/
│   │   │   ├── domain/             # sales.types.ts, sale.mapper.ts
│   │   │   ├── application/        # useSales, queries/
│   │   │   ├── infrastructure/     # sales.service.ts
│   │   │   └── ui/                 # Componentes de ventas
│   │   │
│   │   ├── cash/
│   │   │   ├── domain/             # cash.ts, cash.mapper.ts, schemas
│   │   │   ├── application/        # use-cash-register, stores/
│   │   │   ├── infrastructure/     # cash.service, cash-realtime.service
│   │   │   └── ui/                 # Componentes de caja
│   │   │
│   │   ├── checkout/
│   │   │   ├── domain/             # cart.types.ts
│   │   │   ├── application/        # useCheckout, cart.store
│   │   │   └── ui/                 # Componentes de checkout
│   │   │
│   │   └── pos/
│   │       ├── application/        # use-barcode-scanner
│   │       └── ui/                 # Componentes POS
│   │
│   ├── components/                  # Componentes compartidos
│   │   ├── ui/                     # shadcn/ui base components
│   │   ├── shared/                 # Componentes reutilizables
│   │   ├── layout/                 # Layout components
│   │   └── navigation/             # Navegación
│   │
│   ├── lib/                         # Utilidades globales
│   │   ├── supabase/
│   │   │   ├── client.ts           # Cliente de Supabase
│   │   │   ├── server.ts           # Server client
│   │   │   └── types.ts            # 🔑 Helpers centralizados (Tables, Inserts, Updates, Enums)
│   │   ├── money.ts                # 💰 Money type y utilidades
│   │   └── utils/                  # Helpers generales
│   │
│   ├── types/                       # Tipos globales
│   │   ├── index.ts
│   │   ├── supabase.generated.ts   # Generado por Supabase CLI
│   │   └── supabase.ts
│   │
│   ├── schemas/                     # Schemas de validación
│   ├── providers/                   # React Context providers
│   ├── middleware.ts
│   └── styles/
│
├── supabase/                        # Configuración de Supabase
│   └── migrations/
│
├── public/
├── .env.local.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Desarrollo

### **Comandos**

```bash
pnpm dev      # Servidor de desarrollo (http://localhost:3000)
pnpm build    # Build para producción
pnpm start    # Servidor de producción
pnpm lint     # Ejecutar linter
pnpm format   # Formatear código
```

### **Patrones de Código**

#### **Domain Mappers**
Cada feature tiene mappers que convierten tipos de DB a tipos de dominio:

```typescript
// features/products/domain/product.mapper.ts
export function mapProduct(raw: ProductDB): Product {
  return {
    ...raw,
    sale_price: money(raw.sale_price),      // number → Money
    cost_price: money(raw.cost_price),      // number → Money
    created_at: raw.created_at ?? new Date().toISOString(),
    is_active: raw.is_active ?? true,
  }
}
```

#### **Type Helpers Centralizados**
```typescript
// lib/supabase/types.ts
export type Tables<T extends keyof Database['public']['Tables']> = ...
export type Inserts<T extends keyof Database['public']['Tables']> = ...
export type Updates<T extends keyof Database['public']['Tables']> = ...
export type Enums<T extends keyof Database['public']['Enums']> = ...
```

#### **Money Type**
```typescript
// lib/money.ts
export type Money = number  // Siempre validado, nunca NaN
export const money = (value: number | null | undefined): Money => ...
export const validateCheckoutTotal = (total: Money): void => ...
```

---

## 🚧 Roadmap

- [x] Next.js 15 + React 19
- [x] Feature First Architecture
- [x] Type Safety con Supabase generated types
- [x] Domain Mappers para todas las features
- [x] POS con checkout
- [x] Gestión de caja (apertura/cierre/movimientos)
- [x] Productos pesables (kg, g, L, ml)
- [x] Multi-tenant con RLS
- [x] Roles (Admin/Cajero)
- [ ] Tests unitarios y E2E
- [ ] Reportes y analytics
- [ ] Modo offline (PWA)

---

## 📄 Licencia

MIT © [Tu Nombre](https://github.com/tu-usuario)
