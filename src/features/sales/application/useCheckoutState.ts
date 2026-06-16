
// ─── use-checkout-state.ts ──────────────────────────────────────────────────
// SRP: único responsable del estado del checkout
 
import { useState, useCallback } from 'react'
import { CheckoutState } from '../domain/sale.types'
 
const INITIAL_STATE: CheckoutState = {
  loading: false,
  success: false,
  error: null,
  saleNumber: null,
}
 
export function useCheckoutState() {
  const [state, setState] = useState<CheckoutState>(INITIAL_STATE)
 
  const setLoading = useCallback(() =>
    setState({ loading: true, success: false, error: null, saleNumber: null }), [])
 
  const setSuccess = useCallback((saleNumber:string | number) =>
    setState({ loading: false, success: true, error: null, saleNumber }), [])
 
  const setError = useCallback((error: string) =>
    setState({ loading: false, success: false, error, saleNumber: null }), [])
 
  const reset = useCallback(() => setState(INITIAL_STATE), [])
 
  return { state, setLoading, setSuccess, setError, reset }
}