import type { AuthRepository, LoginPayload } from "@/domain/repositories/AuthRepository"
import type { User } from "@/domain/entities/User"
import { supabase } from "@/infrastructure/supabase/client"

export class AuthRepositoryImpl implements AuthRepository {
  async login(payload: LoginPayload): Promise<User> {
    const email = await this.resolveEmail(payload.identifier)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: payload.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user?.email) {
      throw new Error("User data tidak tersedia.")
    }

    return {
      id: data.user.id,
      email: data.user.email,
    }
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  private async resolveEmail(identifier: string) {
    const normalizedIdentifier = identifier.trim()

    if (this.isEmail(normalizedIdentifier)) {
      return normalizedIdentifier
    }

    const usernameTable = import.meta.env.VITE_AUTH_USERNAME_TABLE ?? "profiles"
    const usernameColumn = import.meta.env.VITE_AUTH_USERNAME_COLUMN ?? "username"
    const emailColumn = import.meta.env.VITE_AUTH_EMAIL_COLUMN ?? "email"

    const { data, error } = await supabase
      .from(usernameTable)
      .select(emailColumn)
      .eq(usernameColumn, normalizedIdentifier)
      .maybeSingle()

    if (error) {
      throw new Error(
        `Username login belum siap. Pastikan tabel publik ${usernameTable} memiliki kolom ${usernameColumn} dan ${emailColumn}.`,
      )
    }

    const email = data?.[emailColumn as keyof typeof data]

    if (typeof email !== "string" || email.length === 0) {
      throw new Error("Username tidak ditemukan.")
    }

    return email
  }

  private isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
}
