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
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [Arquitectura](#-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación Técnica](#-documentación-técnica)
- [Licencia](#-licencia)

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

## 📦 Instalación

### **Prerrequisitos**
- **Node.js 20+** (recomendado 20.12+)
- **pnpm 10.33.3** (requerido - el proyecto usa `only-allow pnpm`)
- Cuenta de **Supabase** (gratuita disponible)

### **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/market-app.git
cd market-app
```

### **Instalar dependencias**
```bash
pnpm install
```

---

## ⚙️ Configuración

### **1. Variables de Entorno**

Copia el archivo de ejemplo:
```bash
cp .env.local.example .env.local
```

Configura las variables en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### **2. Obtener Credenciales de Supabase**

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings → API**
4. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **3. Base de Datos**

El esquema de base de datos incluye:
- `tenants` - Multi-tenancy
- `users` - Usuarios del sistema
- `roles` - Roles y permisos
- `products` - Catálogo de productos
- `categories` - Categorías de productos
- `sales` - Ventas realizadas
- `sale_items` - Detalle de ventas
- `stock_movements` - Movimientos de inventario
- `cash_registers` - Cajas registradoras
- `cash_sessions` - Sesiones de caja
- `cash_movements` - Movimientos de caja

**RPC Functions:**
- `create_sale()` - Crea venta, actualiza stock y registra movimientos

---

## 🚀 Desarrollo

### **Iniciar servidor de desarrollo**
```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

### **Comandos disponibles**
```bash
pnpm dev      # Servidor de desarrollo
pnpm build    # Build para producción
pnpm start    # Servidor de producción
pnpm lint     # Ejecutar linter
pnpm format   # Formatear código con Prettier
```

---

## 🏗️ Arquitectura

### **Principios de Diseño**
- ✅ **Mobile-First:** Diseñado primero para smartphones
- ✅ **Type-Safe:** TypeScript en todo el código
- ✅ **Feature-Based:** Organización modular por features
- ✅ **Server Components:** Aprovecha Next.js 14 App Router
- ✅ **Real-time:** Supabase Realtime para actualizaciones instantáneas

### **Patrones Implementados**
- **Service Layer:** Lógica de negocio en servicios reutilizables
- **Custom Hooks:** Encapsulación de lógica compleja
- **Zustand Stores:** State management con persist
- **Server Actions:** Mutaciones server-side seguras
- **RLS Policies:** Seguridad a nivel de base de datos

---

## 📁 Estructura del Proyecto

```
market-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rutas públicas (login)
│   │   ├── (protected)/       # Rutas protegidas
│   │   │   ├── pos/          # Punto de venta
│   │   │   ├── cash/         # Gestión de caja
│   │   │   ├── products/     # Gestión de productos
│   │   │   ├── sales/        # Historial de ventas
│   │   │   └── config/       # Configuración
│   │   ├── layout.tsx        # Layout raíz
│   │   └── page.tsx          # Página principal
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── shared/           # Componentes compartidos
│   │   ├── pos/              # Componentes del POS
│   │   ├── cash/             # Componentes de caja
│   │   ├── cart/             # Componentes del carrito
│   │   ├── checkout/         # Componentes de checkout
│   │   ├── products/         # Componentes de productos
│   │   ├── scanner/          # Barcode scanner
│   │   └── auth/             # Componentes de auth
│   │
│   ├── services/              # Servicios de API
│   │   ├── auth.service.ts
│   │   ├── cash.service.ts
│   │   ├── cash-realtime.service.ts
│   │   ├── product.service.ts
│   │   ├── sale.service.ts
│   │   ├── category.service.ts
│   │   └── stock-movement.service.ts
│   │
│   ├── stores/                # Zustand stores
│   │   ├── auth.store.ts     # Autenticación
│   │   ├── cart.store.ts     # Carrito de compras
│   │   └── cash.store.ts     # Caja activa
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-tenant.ts
│   │   ├── use-cash-register.ts
│   │   ├── use-cash-movements.ts
│   │   ├── use-checkout.ts
│   │   ├── use-products.ts
│   │   └── use-barcode-scanner.ts
│   │
│   ├── lib/                   # Utilidades y helpers
│   │   ├── supabase/         # Clientes de Supabase
│   │   ├── utils/            # Funciones utilitarias
│   │   └── constants/        # Constantes
│   │
│   ├── types/                 # TypeScript types
│   │   ├── auth.ts
│   │   ├── cash.ts
│   │   ├── product.ts
│   │   ├── sale.ts
│   │   └── supabase.ts
│   │
│   ├── constants/             # Constantes de la aplicación
│   │   └── cash-movement-types.ts
│   │
│   ├── providers/             # Context providers
│   │   └── theme-provider.tsx
│   │
│   ├── middleware.ts          # Middleware de Next.js
│   └── styles/               # Estilos globales
│       └── globals.css
│
├── public/                    # Assets estáticos
├── .env.local.example        # Ejemplo de variables de entorno
├── next.config.mjs           # Configuración de Next.js
├── tailwind.config.ts        # Configuración de Tailwind
├── tsconfig.json             # Configuración de TypeScript
├── package.json              # Dependencias
└── README.md                 # Este archivo
```

---

## 📚 Documentación Técnica

### **Flujo de Venta Completo**

```
1. Usuario busca/escanea producto
   ↓
2. Producto se agrega al carrito (Zustand)
   ↓
3. Usuario ajusta cantidades
   ↓
4. Click "Ver Carrito" → CartSheet
   ↓
5. Click "Cobrar" → CheckoutModal
   ↓
6. Selecciona método de pago
   ↓
7. Confirma venta
   ↓
8. useCheckout valida:
   - Usuario autenticado ✓
   - Tenant activo ✓
   - Sesión de caja abierta ✓
   - Carrito no vacío ✓
   ↓
9. Llama a saleService.createSale()
   ↓
10. RPC create_sale() en Supabase:
    - Crea registro en sales
    - Crea sale_items
    - Descuenta stock (stock_movements)
    - Registra cash_movement (si es CASH)
    - Todo en transacción atómica
   ↓
11. Retorna sale_id y sale_number
   ↓
12. UI muestra éxito
   ↓
13. Limpia carrito
   ↓
14. Realtime actualiza /cash automáticamente
```

### **Gestión de Caja**

**Apertura de Sesión:**
```typescript
1. Usuario va a /cash
2. Click "Abrir Caja"
3. Ingresa monto inicial (ej: $10,000)
4. cashService.openCashSession()
5. Crea cash_session con status='open'
6. Guarda en useCashStore
7. Persiste en localStorage
```

**Durante la Sesión:**
```typescript
- Cada venta crea un cash_movement tipo 'SALE'
- Ingresos/Egresos manuales crean movimientos
- getCashSummary() calcula balance en tiempo real:
  Balance = Opening + Sales + Income - Expenses
- Realtime actualiza UI automáticamente
```

**Cierre de Sesión:**
```typescript
1. Click "Cerrar Caja"
2. Muestra resumen de movimientos
3. Usuario confirma monto de cierre
4. cashService.closeCashSession()
5. Actualiza status='closed'
6. Limpia useCashStore
```

### **Type Safety**

Todos los tipos de movimientos de caja están centralizados:

```typescript
// src/constants/cash-movement-types.ts
export const CASH_MOVEMENT_TYPES = {
  SALE: 'SALE',
  EXPENSE: 'EXPENSE',
  INCOME: 'INCOME',
  OPENING: 'OPENING',
  CLOSING: 'CLOSING',
  ADJUSTMENT: 'ADJUSTMENT',
} as const

export type CashMovementType =
  (typeof CASH_MOVEMENT_TYPES)[keyof typeof CASH_MOVEMENT_TYPES]
```

### **Realtime Updates**

```typescript
// src/services/cash-realtime.service.ts
class CashRealtimeService {
  subscribe(cashRegisterId: string, callbacks: {
    onInsert: (movement: CashMovement) => void
    onUpdate: (movement: CashMovement) => void
  }) {
    return supabase
      .channel(`cash_movements:${cashRegisterId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'cash_movements',
        filter: `cash_register_id=eq.${cashRegisterId}`
      }, callbacks.onInsert)
      .subscribe()
  }
}
```

---

## 🔒 Seguridad

### **Row Level Security (RLS)**

Todas las tablas tienen políticas RLS que garantizan:
- Los usuarios solo ven datos de su tenant
- Las operaciones están limitadas por rol
- Las sesiones son validadas en cada request

### **Autenticación SSR**

- Cookies HTTP-only seguras
- Validación server-side en middleware
- Refresh automático de tokens
- Logout seguro con Server Actions

---

## 🎨 Theming

El sistema soporta:
- **Light Mode:** Diseño minimalista y limpio
- **Dark Mode:** Colores suaves para uso nocturno
- **System Preference:** Detecta preferencia del sistema
- **Persistencia:** Guarda preferencia del usuario

Paleta de colores inspirada en Mercado Pago y Shopify.

---

## 📱 Mobile-First

### **Optimizaciones**
- Touch targets mínimo 44px
- Bottom navigation para acceso rápido
- Safe areas para iOS/Android
- 100dvh viewport
- Gestos táctiles intuitivos
- Animaciones suaves
- PWA ready

---

## 🐛 Debugging

### **Herramientas de Desarrollo**

El proyecto está optimizado para debugging con:

- **React DevTools** - Inspección de componentes y props
- **TanStack Query DevTools** - Monitoreo de queries y cache
- **Zustand DevTools** - Inspección de state global
- **Supabase Dashboard** - Logs de base de datos y queries
- **Network Tab** - Análisis de llamadas API
- **Console Errors** - Solo errores críticos en producción

### **Manejo de Errores**

El código mantiene `console.error` para errores críticos:
- Errores de autenticación
- Fallos de base de datos
- Errores de permisos (RLS)
- Excepciones de checkout
- Errores de scanner

**Nota:** Todos los `console.log` de desarrollo han sido removidos para producción.

---

## 🚧 Roadmap

### **Completado ✅**
- [x] Setup inicial con Next.js 15 + React 19
- [x] Autenticación SSR con Supabase
- [x] Sistema de theming (dark/light)
- [x] Layout mobile-first responsive
- [x] POS con carrito y checkout optimizado
- [x] Barcode scanner (ZXing)
- [x] Gestión de caja (apertura/cierre/movimientos)
- [x] Realtime updates (Supabase Realtime)
- [x] CRUD de productos con categorías
- [x] Historial de ventas con filtros
- [x] Control de stock automático
- [x] Sistema multi-tenant con RLS
- [x] Roles de usuario (Admin/Cajero)
- [x] Productos pesables (kg, g, L, ml)
- [x] Input de moneda con formato
- [x] Optimización para producción (sin console.log)

### **En Progreso 🚧**
- [ ] Tests unitarios y E2E
- [ ] Reportes y analytics
- [ ] Exportación de datos
- [ ] Notificaciones push

### **Futuro 🔮**
- [ ] Multi-caja (varios dispositivos)
- [ ] Integración con impresoras térmicas
- [ ] Modo offline (PWA)
- [ ] Dashboard de administración
- [ ] API pública

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@example.com

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

**¿Preguntas o problemas?** Abre un [issue](https://github.com/tu-usuario/market-app/issues) en GitHub.
