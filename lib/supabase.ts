import { createClient } from '@supabase/supabase-js'

// Die Credentials kommen aus deiner .env.local-Datei
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Unser Supabase-Client für die ganze App
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript-Typen für unsere Tabellen (hilft bei Auto-Vervollständigung)
export type Brand = {
  id: string
  name: string
  slug: string
  handle: string | null
  initial: string
  description: string | null
  city: string
  lat: number | null
  lng: number | null
  category: string
  rating: number
}

export type Deal = {
  id: string
  brand_id: string
  type: 'barter' | 'ugc'
  title: string
  subtitle: string | null
  about: string | null
  category: string
  badge: string | null
  value_eur: number | null
  requirements: string | null
  credit_description: string | null
  slots_description: string | null
  deadline: string | null
  // Brand-Info gejoined (kommt von Query mit .select('*, brands(*)') )
  brands?: Brand
}

export type Creator = {
  id: string
  instagram_handle: string | null
  full_name: string
  city: string
  follower_count: number
  rating: number
  reviews_count: number
  tier: 'silver' | 'gold' | 'platinum'
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
}
