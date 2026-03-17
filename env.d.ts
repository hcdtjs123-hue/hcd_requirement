/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_AUTH_USERNAME_TABLE?: string
  readonly VITE_AUTH_USERNAME_COLUMN?: string
  readonly VITE_AUTH_EMAIL_COLUMN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
