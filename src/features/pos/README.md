# POS (Point of Sale) Feature

Feature completa para el sistema de Punto de Venta siguiendo arquitectura Feature First.

## Estructura

```
features/pos/
├── domain/              # Tipos y lógica de negocio
│   ├── cart.types.ts   # Tipos del carrito
│   └── pos.types.ts    # Tipos del POS
├── application/         # Hooks y lógica de aplicación
│   ├── use-barcode-scanner.ts
│   └── use-product-search.ts
├── infrastructure/      # Servicios y acceso a datos
│   └── pos.service.ts
├── ui/                  # Componentes de UI
│   ├── barcode-scanner.tsx
│   ├── product-card.tsx
│   ├── product-list-states.tsx
│   └── search-input.tsx
└── index.ts            # Exports públicos
```

## Uso

### Búsqueda de Productos

```typescript
import { useProductSearch } from '@/features/pos/application/use-product-search'

const { query, setQuery, products, loading, error } = useProductSearch({
  debounceMs: 300,
  autoSearch: true
})
```

### Escáner de Código de Barras

```typescript
import { useBarcodeScanner } from '@/features/pos/application/use-barcode-scanner'

const { videoRef, isScanning, hasPermission, error } = useBarcodeScanner({
  onScan: (barcode) => console.log(barcode),
  enabled: true
})
```

### Servicio POS

```typescript
import { posService } from '@/features/pos/infrastructure/pos.service'

// Buscar productos
const result = await posService.searchProducts(tenantId, 'query')

// Obtener por código de barras
const product = await posService.getProductByBarcode(tenantId, barcode)

// Validar producto para venta
const validation = await posService.validateProductForSale(product)
```

## Componentes UI

- **ProductCard**: Tarjeta de producto con acciones de carrito
- **ProductListStates**: Estados de carga, vacío, error
- **SearchInput**: Input de búsqueda con debounce
- **BarcodeScanner**: Modal de escáner de código de barras

## Tipos de Dominio

### POSTypes
- `ProductSearchState`: Estado de búsqueda
- `BarcodeScannerState`: Estado del escáner
- `POSState`: Estado general del POS

### CartTypes
- `CartItem`: Item del carrito
- `CartState`: Estado del carrito
- `AddItemResult`: Resultado de agregar item
- `CartOperations`: Operaciones del carrito
- `CartValidation`: Validaciones del carrito

## Dependencias

- `@/features/products` - Para tipos y servicios de productos
- `@/features/checkout` - Para el carrito de compras
- `@/features/auth` - Para tenant y autenticación
- `@zxing/library` - Para escáner de código de barras
