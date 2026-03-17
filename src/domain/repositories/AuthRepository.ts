import type { User } from "@/domain/entities/User"

export interface LoginPayload {
  identifier: string
  password: string
}

export interface AuthRepository {
  login(payload: LoginPayload): Promise<User>
  logout(): Promise<void>
}
