import type { AuthRepository, LoginPayload } from "@/domain/repositories/AuthRepository"

export function loginUser(authRepository: AuthRepository, payload: LoginPayload) {
  return authRepository.login(payload)
}
