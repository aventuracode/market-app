'use client'

import { ShoppingCart, Search, Scan } from 'lucide-react'
import { motion } from 'framer-motion'

export function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 shadow-sm">
        <ShoppingCart className="h-16 w-16 text-primary/60" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-2xl font-bold mb-2">
        No hay productos en el carrito
      </h3>
      
      <p className="text-sm text-muted-foreground/80 max-w-xs mb-6">
        Busca productos o escanea un código para comenzar
      </p>

      <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>Buscar</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Scan className="h-4 w-4" />
          <span>Escanear</span>
        </div>
      </div>
    </motion.div>
  )
}
