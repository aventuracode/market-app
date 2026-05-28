#!/bin/bash

# Script para generar tipos de Supabase
# Uso: ./scripts/generate-types.sh

set -e

echo "🔍 Generando tipos de Supabase..."

# Leer variables de entorno
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local no encontrado"
  echo "Por favor copia .env.local.example a .env.local y configura tus credenciales"
  exit 1
fi

# Extraer SUPABASE_URL
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL no encontrado en .env.local"
  exit 1
fi

# Extraer Project ID de la URL
# Formato: https://abcdefghijklmnop.supabase.co
PROJECT_ID=$(echo $SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')

echo "📦 Project ID: $PROJECT_ID"
echo "🔗 URL: $SUPABASE_URL"

# Generar tipos
echo "⚙️  Generando tipos TypeScript..."
npx supabase gen types typescript \
  --project-id "$PROJECT_ID" \
  --schema public \
  > src/types/supabase.ts

echo "✅ Tipos generados en src/types/supabase.ts"
echo ""
echo "📝 Próximos pasos:"
echo "1. Revisa src/types/supabase.ts"
echo "2. Actualiza src/lib/supabase/client.ts para usar los tipos"
echo "3. Actualiza los servicios para usar los tipos generados"
