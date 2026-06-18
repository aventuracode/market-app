'use client'

import { useMemo } from 'react'
import { createClient } from '@/shared/supabase/client'

export function useSupabase() {
  const supabase = useMemo(() => createClient(), [])

  return supabase
}
