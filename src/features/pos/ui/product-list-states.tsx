'use client'

import { Search, Package, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function ProductListLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="card-premium p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="h-10 w-10 bg-muted rounded-xl" />
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="h-8 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductListEmpty({ hasQuery }: { hasQuery: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        {hasQuery ? (
          <Search className="h-10 w-10 text-muted-foreground" />
        ) : (
          <Package className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {hasQuery ? 'No se encontraron productos' : 'Busca un producto'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {hasQuery
          ? 'Intenta con otro término de búsqueda o verifica la ortografía'
          : 'Usa el buscador para encontrar productos por nombre, SKU o código de barras'}
      </p>
    </motion.div>
  )
}

export function ProductListError({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <Package className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-destructive">
        Error al cargar productos
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {message}
      </p>
    </motion.div>
  )
}

export function ProductListSearching() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Buscando productos...</p>
      </div>
    </div>
  )
}
