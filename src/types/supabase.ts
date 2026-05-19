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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: 'ADMIN' | 'CAJERO' | 'SUPERVISOR'
          tenant_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'ADMIN' | 'CAJERO' | 'SUPERVISOR'
          tenant_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'ADMIN' | 'CAJERO' | 'SUPERVISOR'
          tenant_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          tenant_id: string
          name: string
          barcode: string | null
          price: number
          stock: number
          category_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          barcode?: string | null
          price: number
          stock?: number
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          barcode?: string | null
          price?: number
          stock?: number
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          tenant_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
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
          total: number
          payment_method: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          cash_register_id: string
          total: number
          payment_method: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          cash_register_id?: string
          total?: number
          payment_method?: string
          created_at?: string
        }
      }
      sale_details: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
        }
      }
      cash_registers: {
        Row: {
          id: string
          tenant_id: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cash_movements: {
        Row: {
          id: string
          cash_register_id: string
          user_id: string
          type: 'APERTURA' | 'CIERRE' | 'VENTA' | 'RETIRO' | 'INGRESO'
          amount: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cash_register_id: string
          user_id: string
          type: 'APERTURA' | 'CIERRE' | 'VENTA' | 'RETIRO' | 'INGRESO'
          amount: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cash_register_id?: string
          user_id?: string
          type?: 'APERTURA' | 'CIERRE' | 'VENTA' | 'RETIRO' | 'INGRESO'
          amount?: number
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_sale: {
        Args: {
          p_tenant_id: string
          p_user_id: string
          p_cash_register_id: string
          p_total: number
          p_payment_method: string
          p_items: Json
        }
        Returns: {
          sale_id: string
          success: boolean
          message: string
        }
      }
    }
    Enums: {
      user_role: 'ADMIN' | 'CAJERO' | 'SUPERVISOR'
      movement_type: 'APERTURA' | 'CIERRE' | 'VENTA' | 'RETIRO' | 'INGRESO'
    }
  }
}
