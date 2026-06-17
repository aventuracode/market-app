import type { ProductWithCategory } from '@/features/products/domain/product'

export interface ProductSearchState {
  query: string
  products: ProductWithCategory[]
  loading: boolean
  error: string | null
  hasMore: boolean
  total: number
}

export interface BarcodeScannerState {
  isScanning: boolean
  hasPermission: boolean | null
  error: string | null
}

export interface POSState {
  searchState: ProductSearchState
  scannerOpen: boolean
  cartOpen: boolean
}

export interface ProductSearchOptions {
  debounceMs?: number
  autoSearch?: boolean
}

export interface BarcodeScannerOptions {
  onScan: (barcode: string) => void
  onError?: (error: Error) => void
  enabled?: boolean
}
