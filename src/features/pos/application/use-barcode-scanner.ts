'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import type { BarcodeScannerOptions } from '../domain/pos.types'

export function useBarcodeScanner({ 
  onScan, 
  onError,
  enabled = false 
}: BarcodeScannerOptions) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<any>(null)

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop()
      controlsRef.current = null
    }
    if (readerRef.current) {
      readerRef.current.reset()
    }
    setIsScanning(false)
  }, [])

  const startScanning = useCallback(async () => {
    if (!videoRef.current || !enabled) return

    try {
      setError(null)
      setIsScanning(true)

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      setHasPermission(true)
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop())

      // Initialize reader
      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader()
      }

      // Start decoding
      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        null, // Use default camera
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText()
            onScan(barcode)
            stopScanning()
          }
        }
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera'
      setError(errorMessage)
      setHasPermission(false)
      setIsScanning(false)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    }
  }, [enabled, onScan, onError, stopScanning])

  // Start/stop based on enabled prop
  useEffect(() => {
    if (enabled) {
      startScanning()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [enabled, startScanning, stopScanning])

  return {
    videoRef,
    isScanning,
    hasPermission,
    error,
    startScanning,
    stopScanning,
  }
}
