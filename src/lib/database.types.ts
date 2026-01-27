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
      companies: {
        Row: {
          id: string
          name: string
          industry: string
          website: string
          phone: string
          email: string
          address: string
          city: string
          country: string
          notes: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string
          website?: string
          phone?: string
          email?: string
          address?: string
          city?: string
          country?: string
          notes?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string
          website?: string
          phone?: string
          email?: string
          address?: string
          city?: string
          country?: string
          notes?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          company_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string
          job_title: string
          notes: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          first_name: string
          last_name: string
          email?: string
          phone?: string
          job_title?: string
          notes?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          job_title?: string
          notes?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          type: string
          status: string
          start_date: string | null
          end_date: string | null
          budget: number
          description: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: string
          status?: string
          start_date?: string | null
          end_date?: string | null
          budget?: number
          description?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          status?: string
          start_date?: string | null
          end_date?: string | null
          budget?: number
          description?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      campaign_contacts: {
        Row: {
          id: string
          campaign_id: string
          contact_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          contact_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          contact_id?: string
          status?: string
          created_at?: string
        }
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
  }
}
