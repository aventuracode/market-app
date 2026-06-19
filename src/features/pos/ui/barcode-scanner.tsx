'use client'

import { X, Camera, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui/components/button'
import { useBarcodeScanner } from '@/features/pos/application/use-barcode-scanner'
import { useState, useEffect } from 'react'
import { cn } from '@/shared/ui'

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onScan: (barcode: string) => Promise<void>
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleScan = async (barcode: string) => {
    try {
      setScanning(true)
      await onScan(barcode)
      
      // Show success feedback
      setSuccess(true)
      
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
      
      // Auto close after 1 second
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al procesar código')
      
      // Vibrate error pattern
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    } finally {
      setScanning(false)
    }
  }

  const { videoRef, isScanning, hasPermission, error } = useBarcodeScanner({
    onScan: handleScan,
    enabled: open && !success,
  })

  // Reset states when closing
  useEffect(() => {
    if (!open) {
      setSuccess(false)
      setErrorMessage(null)
      setScanning(false)
    }
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
        >
          {/* Video */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <Camera className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Escanear código de barras
                  </h2>
                  <p className="text-sm text-white/70">
                    Apunta la cámara al código
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Scanning Area */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="relative w-72 h-48 border-4 border-white/30 rounded-2xl overflow-hidden">
                  {/* Corner Indicators */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                  
                  {/* Scanning Line Animation */}
                  {isScanning && !success && !errorMessage && (
                    <motion.div
                      className="absolute inset-x-0 h-1 bg-primary shadow-lg shadow-primary/50"
                      animate={{ y: [0, 192, 0] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: 'linear' 
                      }}
                    />
                  )}
                </div>

                {/* Status Text */}
                <div className="mt-6 text-center">
                  {hasPermission === false && (
                    <div className="flex items-center justify-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm font-medium">
                        Permiso de cámara denegado
                      </p>
                    </div>
                  )}
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  {isScanning && !success && !errorMessage && (
                    <p className="text-sm text-white/70">
                      Buscando código...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="max-w-md mx-auto text-center space-y-2">
                <p className="text-sm text-white/70">
                  Coloca el código de barras dentro del marco
                </p>
                <p className="text-xs text-white/50">
                  La detección es automática
                </p>
              </div>
            </div>
          </div>

          {/* Success Overlay */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="w-24 h-24 mx-auto rounded-full bg-success flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </motion.div>
                  <p className="text-xl font-semibold text-white">
                    ¡Producto agregado!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Overlay */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="absolute top-20 left-4 right-4 p-4 bg-destructive/90 backdrop-blur-sm rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-white flex-shrink-0" />
                  <p className="text-sm font-medium text-white">
                    {errorMessage}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
