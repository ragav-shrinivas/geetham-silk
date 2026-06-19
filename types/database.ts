export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      collections: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          banner_url: string | null
          display_order: number
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['collections']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['collections']['Insert']>
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          product_code: string
          description: string | null
          price: number
          original_price: number | null
          category_id: string | null
          collection_id: string | null
          sizes: string[]
          colors: string[]
          material: string | null
          care_instructions: string | null
          is_active: boolean
          is_featured: boolean
          is_trending: boolean
          is_new_arrival: boolean
          is_out_of_stock: boolean
          is_best_seller: boolean
          best_seller_order: number
          show_in_discovery: boolean
          track_inventory: boolean
          stock_quantity: number
          low_stock_threshold: number
          display_order: number
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_images']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>
      }
      gallery: {
        Row: {
          id: string
          title: string | null
          image_url: string
          caption: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['gallery']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['gallery']['Insert']>
      }
      testimonials: {
        Row: {
          id: string
          customer_name: string
          location: string | null
          rating: number
          review: string
          product_id: string | null
          avatar_url: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['testimonials']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['testimonials']['Insert']>
      }
      homepage_content: {
        Row: {
          id: string
          section: string
          content: Json
          is_active: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['homepage_content']['Row'], 'id' | 'updated_at'> & { id?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['homepage_content']['Insert']>
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'updated_at'> & { id?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
      page_sections: {
        Row: {
          id: string
          page: string
          section_key: string
          display_order: number
          is_visible: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['page_sections']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['page_sections']['Insert']>
      }
      media: {
        Row: {
          id: string
          name: string
          url: string
          path: string
          type: string
          size_bytes: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['media']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['media']['Insert']>
      }
      hero_slides: {
        Row: {
          id: string
          title: string | null
          subtitle: string | null
          media_type: 'image' | 'video'
          media_url: string | null
          poster_url: string | null
          cta_primary_label: string | null
          cta_primary_link: string | null
          cta_secondary_label: string | null
          cta_secondary_link: string | null
          overlay_opacity: number
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['hero_slides']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['hero_slides']['Insert']>
      }
    }
  }
}

// Convenience types
export type Category = Database['public']['Tables']['categories']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type Gallery = Database['public']['Tables']['gallery']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type HomepageContent = Database['public']['Tables']['homepage_content']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']
export type HeroSlide = Database['public']['Tables']['hero_slides']['Row']
export type PageSection = Database['public']['Tables']['page_sections']['Row']
export type MediaAsset = Database['public']['Tables']['media']['Row']

export type ProductWithImages = Product & {
  product_images: ProductImage[]
  categories: Category | null
  collections: Collection | null
}
