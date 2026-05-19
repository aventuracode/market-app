'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, getCurrentTenantId } from '@/lib/supabase/auth-helpers'
import { revalidatePath } from 'next/cache'

export async function exampleServerAction() {
  const user = await requireAuth()
  const tenantId = await getCurrentTenantId()
  const supabase = await createClient()

  return {
    user,
    tenantId,
  }
}

export async function getProducts() {
  const tenantId = await getCurrentTenantId()

  if (!tenantId) {
    throw new Error('No tenant found')
  }

  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return products
}

export async function createProduct(formData: FormData) {
  const user = await requireAuth()
  const tenantId = await getCurrentTenantId()

  if (!tenantId) {
    throw new Error('No tenant found')
  }

  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const barcode = formData.get('barcode') as string | null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .insert({
      tenant_id: tenantId,
      name,
      price,
      barcode,
      stock: 0,
    } as never)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/products')

  return data
}
