export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      pix_payments: {
        Row: {
          ab_variant: string | null
          amount: number
          created_at: string
          customer_email: string | null
          customer_name: string | null
          id: string
          ip_address: string | null
          page_referrer: string | null
          page_url: string | null
          paid_at: string | null
          payment_type: string | null
          pix_code: string | null
          status: string
          transaction_id: string
          ttclid: string | null
          ttp: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          ab_variant?: string | null
          amount: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          ip_address?: string | null
          page_referrer?: string | null
          page_url?: string | null
          paid_at?: string | null
          payment_type?: string | null
          pix_code?: string | null
          status?: string
          transaction_id: string
          ttclid?: string | null
          ttp?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          ab_variant?: string | null
          amount?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          ip_address?: string | null
          page_referrer?: string | null
          page_url?: string | null
          paid_at?: string | null
          payment_type?: string | null
          pix_code?: string | null
          status?: string
          transaction_id?: string
          ttclid?: string | null
          ttp?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
