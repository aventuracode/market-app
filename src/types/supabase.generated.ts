/**
 * Tipos generados de Supabase
 * 
 * NOTA: Este archivo debe ser generado automáticamente con:
 * npx supabase gen types typescript --project-id <project-id> > src/types/supabase.generated.ts
 * 
 * Por ahora, estos son tipos de ejemplo basados en el esquema conocido.
 * Para generar los tipos reales, sigue la guía en scripts/generate-types-manual.md
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          role_id: number
          email: string
          first_name: string
          last_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id: string
          role_id: number
          email: string
          first_name: string
          last_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          role_id?: number
          email?: string
          first_name?: string
          last_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          tenant_id: string
          category_id: string | null
          name: string
          description: string | null
          sku: string | null
          barcode: string | null
          purchase_price: number
          sale_price: number
          stock: number
          min_stock: number
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          category_id?: string | null
          name: string
          description?: string | null
          sku?: string | null
          barcode?: string | null
          purchase_price: number
          sale_price: number
          stock?: number
          min_stock?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          sku?: string | null
          barcode?: string | null
          purchase_price?: number
          sale_price?: number
          stock?: number
          min_stock?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          cash_register_id: string
          cash_session_id: string
          sale_number: string
          payment_method: 'CASH' | 'CARD' | 'TRANSFER'
          subtotal: number
          tax: number
          discount: number
          total: number
          status: 'COMPLETED' | 'PENDING' | 'CANCELLED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          cash_register_id: string
          cash_session_id: string
          sale_number: string
          payment_method: 'CASH' | 'CARD' | 'TRANSFER'
          subtotal: number
          tax: number
          discount: number
          total: number
          status?: 'COMPLETED' | 'PENDING' | 'CANCELLED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          cash_register_id?: string
          cash_session_id?: string
          sale_number?: string
          payment_method?: 'CASH' | 'CARD' | 'TRANSFER'
          subtotal?: number
          tax?: number
          discount?: number
          total?: number
          status?: 'COMPLETED' | 'PENDING' | 'CANCELLED'
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
      }
      cash_registers: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cash_sessions: {
        Row: {
          id: string
          tenant_id: string
          cash_register_id: string
          user_id: string
          opening_amount: number
          closing_amount: number | null
          expected_amount: number | null
          difference: number | null
          status: 'open' | 'closed'
          opened_at: string
          closed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          cash_register_id: string
          user_id: string
          opening_amount: number
          closing_amount?: number | null
          expected_amount?: number | null
          difference?: number | null
          status?: 'open' | 'closed'
          opened_at?: string
          closed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          cash_register_id?: string
          user_id?: string
          opening_amount?: number
          closing_amount?: number | null
          expected_amount?: number | null
          difference?: number | null
          status?: 'open' | 'closed'
          opened_at?: string
          closed_at?: string | null
          notes?: string | null
        }
      }
      cash_movements: {
        Row: {
          id: string
          tenant_id: string
          cash_register_id: string
          cash_session_id: string
          user_id: string
          type: 'SALE' | 'EXPENSE' | 'INCOME' | 'OPENING' | 'CLOSING' | 'ADJUSTMENT'
          amount: number
          notes: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          cash_register_id: string
          cash_session_id: string
          user_id: string
          type: 'SALE' | 'EXPENSE' | 'INCOME' | 'OPENING' | 'CLOSING' | 'ADJUSTMENT'
          amount: number
          notes?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          cash_register_id?: string
          cash_session_id?: string
          user_id?: string
          type?: 'SALE' | 'EXPENSE' | 'INCOME' | 'OPENING' | 'CLOSING' | 'ADJUSTMENT'
          amount?: number
          notes?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          tenant_id: string
          product_id: string
          user_id: string
          type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT'
          quantity: number
          notes: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          product_id: string
          user_id: string
          type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT'
          quantity: number
          notes?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          product_id?: string
          user_id?: string
          type?: 'SALE' | 'PURCHASE' | 'ADJUSTMENT'
          quantity?: number
          notes?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      create_sale: {
        Args: {
          p_tenant_id: string
          p_user_id: string
          p_cash_register_id: string
          p_cash_session_id: string
          p_payment_method: 'CASH' | 'CARD' | 'TRANSFER'
          p_items: Json
        }
        Returns: string
      }
    }
  }
}
