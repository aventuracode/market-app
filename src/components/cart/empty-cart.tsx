'use client'

import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

export function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">
        Carrito vacío
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Agrega productos desde el buscador para comenzar una venta
      </p>
    </motion.div>
  )
}
