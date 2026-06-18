// Domain types
export * from './product'
export * from './stock'
export * from './category.schema'

// Domain mappers
export { mapProduct, mapProductWithCategory, mapProducts } from './product.mapper'
export { 
  mapCategory, 
  mapCategoryWithProductCount, 
  mapCategories, 
  mapCategoriesWithProductCount 
} from './category.mapper'

// Domain helpers
export * from './product-helpers'
export * from './format-stock'
