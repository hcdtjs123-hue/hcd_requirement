import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL belum diisi di file .env")
}

if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_SERVICE_ROLE_KEY belum diisi di file .env")
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
)
