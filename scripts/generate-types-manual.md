# 📝 Generar Tipos de Supabase - Guía Manual

Como alternativa al CLI, puedes generar los tipos manualmente desde el dashboard de Supabase.

## Opción 1: Supabase Dashboard (Recomendado)

1. **Ve a tu proyecto en Supabase:**
   ```
   https://app.supabase.com/project/aentvhpqtvighjqlqagz
   ```

2. **Ve a Settings → API**

3. **Scroll hasta "Generate Types"**

4. **Copia el código TypeScript generado**

5. **Pega en `src/types/supabase.ts`**

---

## Opción 2: Supabase CLI con Login

```bash
# 1. Login en Supabase
npx supabase login

# 2. Generar tipos
npx supabase gen types typescript \
  --project-id aentvhpqtvighjqlqagz \
  --schema public \
  > src/types/supabase.ts
```

---

## Opción 3: Usar DB URL directamente

Si tienes acceso a la connection string:

```bash
npx supabase gen types typescript \
  --db-url "postgresql://postgres:[PASSWORD]@db.aentvhpqtvighjqlqagz.supabase.co:5432/postgres" \
  --schema public \
  > src/types/supabase.ts
```

---

## Después de Generar los Tipos

1. **Actualiza el cliente de Supabase:**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

2. **Usa los tipos en servicios:**

```typescript
// src/services/product.service.ts
import type { Database } from '@/types/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
```

---

## Verificar Tipos Generados

Los tipos deben incluir:

```typescript
export type Database = {
  public: {
    Tables: {
      products: {
        Row: { ... }
        Insert: { ... }
        Update: { ... }
      }
      sales: { ... }
      cash_movements: { ... }
      // etc...
    }
    Functions: {
      create_sale: {
        Args: { ... }
        Returns: ...
      }
    }
  }
}
```
