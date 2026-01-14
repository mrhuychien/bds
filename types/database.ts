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
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string
          email: string | null
          avatar_url: string | null
          company_name: string | null
          title: string
          bio: string | null
          working_areas: string[] | null
          watermark_settings: Json
          zalo_link: string | null
          facebook_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone: string
          email?: string | null
          avatar_url?: string | null
          company_name?: string | null
          title?: string
          bio?: string | null
          working_areas?: string[] | null
          watermark_settings?: Json
          zalo_link?: string | null
          facebook_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          email?: string | null
          avatar_url?: string | null
          company_name?: string | null
          title?: string
          bio?: string | null
          working_areas?: string[] | null
          watermark_settings?: Json
          zalo_link?: string | null
          facebook_link?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          title: string
          slug: string | null
          property_type: string
          status: string
          listing_type: string
          price: number
          price_unit: string
          is_negotiable: boolean
          area: number | null
          frontage: number | null
          floors: number | null
          bedrooms: number | null
          bathrooms: number | null
          province: string | null
          district: string | null
          ward: string | null
          street: string | null
          address_detail: string | null
          latitude: number | null
          longitude: number | null
          legal_status: string | null
          direction: string | null
          features: string[] | null
          description: string | null
          ai_description: string | null
          images: string[] | null
          watermarked_images: string[] | null
          thumbnail_url: string | null
          is_public: boolean
          microsite_views: number
          source: string | null
          commission_rate: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          slug?: string | null
          property_type: string
          status?: string
          listing_type?: string
          price: number
          price_unit?: string
          is_negotiable?: boolean
          area?: number | null
          frontage?: number | null
          floors?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          province?: string | null
          district?: string | null
          ward?: string | null
          street?: string | null
          address_detail?: string | null
          latitude?: number | null
          longitude?: number | null
          legal_status?: string | null
          direction?: string | null
          features?: string[] | null
          description?: string | null
          ai_description?: string | null
          images?: string[] | null
          watermarked_images?: string[] | null
          thumbnail_url?: string | null
          is_public?: boolean
          microsite_views?: number
          source?: string | null
          commission_rate?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          slug?: string | null
          property_type?: string
          status?: string
          listing_type?: string
          price?: number
          price_unit?: string
          is_negotiable?: boolean
          area?: number | null
          frontage?: number | null
          floors?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          province?: string | null
          district?: string | null
          ward?: string | null
          street?: string | null
          address_detail?: string | null
          latitude?: number | null
          longitude?: number | null
          legal_status?: string | null
          direction?: string | null
          features?: string[] | null
          description?: string | null
          ai_description?: string | null
          images?: string[] | null
          watermarked_images?: string[] | null
          thumbnail_url?: string | null
          is_public?: boolean
          microsite_views?: number
          source?: string | null
          commission_rate?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          owner_id: string
          full_name: string
          phone: string
          email: string | null
          customer_type: string
          status: string
          priority: string
          demand: Json
          source: string | null
          source_property_id: string | null
          last_contact_at: string | null
          next_follow_up: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          full_name: string
          phone: string
          email?: string | null
          customer_type?: string
          status?: string
          priority?: string
          demand?: Json
          source?: string | null
          source_property_id?: string | null
          last_contact_at?: string | null
          next_follow_up?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          full_name?: string
          phone?: string
          email?: string | null
          customer_type?: string
          status?: string
          priority?: string
          demand?: Json
          source?: string | null
          source_property_id?: string | null
          last_contact_at?: string | null
          next_follow_up?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_views: {
        Row: {
          id: string
          property_id: string
          visitor_ip: string | null
          user_agent: string | null
          referrer: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          property_id: string
          visitor_ip?: string | null
          user_agent?: string | null
          referrer?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          visitor_ip?: string | null
          user_agent?: string | null
          referrer?: string | null
          viewed_at?: string
        }
      }
      customer_interactions: {
        Row: {
          id: string
          customer_id: string
          owner_id: string
          type: string
          content: string | null
          property_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          owner_id: string
          type: string
          content?: string | null
          property_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          owner_id?: string
          type?: string
          content?: string | null
          property_id?: string | null
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

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience types
export type Profile = Tables<'profiles'>
export type Property = Tables<'properties'>
export type Customer = Tables<'customers'>
export type PropertyView = Tables<'property_views'>
export type CustomerInteraction = Tables<'customer_interactions'>
