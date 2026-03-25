import type { AuthRepository, LoginPayload } from '@/domain/repositories/AuthRepository'
import type { User } from '@/domain/entities/User'
import { supabase } from '@/infrastructure/supabase/client'

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
      throw new Error('User data tidak tersedia.')
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

    const usernameTable = import.meta.env.VITE_AUTH_USERNAME_TABLE ?? 'employees'
    const usernameColumn = import.meta.env.VITE_AUTH_USERNAME_COLUMN ?? 'username'
    const idColumn = import.meta.env.VITE_AUTH_USER_ID_COLUMN ?? 'id'
    const normalizedUsername = normalizedIdentifier.replace(/^@/, '')

    const { data, error } = await supabase
      .from(usernameTable)
      .select(idColumn)
      .ilike(usernameColumn, normalizedUsername)
      .maybeSingle()

    if (error) {
      throw new Error(
        `Username login belum siap. Pastikan tabel publik ${usernameTable} memiliki kolom ${usernameColumn} dan ${idColumn}.`,
      )
    }

    const userId = data?.[idColumn as keyof typeof data]

    if (typeof userId !== 'string' || userId.length === 0) {
      throw new Error('Username tidak ditemukan.')
    }

    return this.getAuthEmailByUserId(userId)
  }

  private async getAuthEmailByUserId(userId: string) {
    const perPage = 1000
    let page = 1

    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

      if (error) {
        throw new Error('Gagal mengambil data akun untuk proses login.')
      }

      const matchedUser = data.users.find((user) => user.id === userId)
      if (matchedUser?.email) {
        return matchedUser.email
      }

      if (!data.nextPage) {
        break
      }

      page = data.nextPage
    }

    throw new Error('Email akun untuk username tersebut tidak ditemukan.')
  }

  private isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
}
