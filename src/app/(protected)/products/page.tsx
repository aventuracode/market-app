import { PageContainer } from '@/shared/ui/layout/page-container'
import { ProductosClient } from './products-client'

export default function ProductsPage() {
  return (
    <PageContainer title="Productos">
      <ProductosClient />
    </PageContainer>
  )
}
