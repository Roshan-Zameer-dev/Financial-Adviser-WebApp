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
      portfolios: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          id: string
          portfolio_id: string
          symbol: string
          name: string
          asset_type: string
          quantity: number
          purchase_price: number
          purchase_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          symbol: string
          name: string
          asset_type: string
          quantity: number
          purchase_price: number
          purchase_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          symbol?: string
          name?: string
          asset_type?: string
          quantity?: number
          purchase_price?: number
          purchase_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_portfolio_id_fkey"
            columns: ["portfolio_id"]
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          }
        ]
      }
      simulations: {
        Row: {
          id: string
          user_id: string | null
          name: string
          initial_amount: number
          annual_return: number
          years: number
          monthly_contribution: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          initial_amount: number
          annual_return: number
          years: number
          monthly_contribution?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          initial_amount?: number
          annual_return?: number
          years?: number
          monthly_contribution?: number
          created_at?: string
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