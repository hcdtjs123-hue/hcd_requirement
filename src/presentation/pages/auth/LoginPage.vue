<template>
  <main class="relative min-h-screen overflow-hidden bg-gray-50 text-gray-900">
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.1),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(147,197,253,0.08),_transparent_30%)]" />

    <div class="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section class="hidden lg:block">
        <p class="text-sm uppercase tracking-[0.35em] text-blue-600">HCD Platform</p>
        <h1 class="mt-6 max-w-xl text-6xl font-semibold leading-none tracking-tight">
          Masuk ke workspace rekrutmen yang lebih rapi.
        </h1>
      </section>

      <section
        class="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-200 sm:p-8">
        <div class="mb-8 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-gray-500">Authentication</p>
            <h2 class="text-2xl font-semibold tracking-tight">Login</h2>
          </div>
        </div>

        <Form class="space-y-5" @submit="onSubmit">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700" for="identifier">Email atau Username</label>
            <div
              class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-blue-600">
              <Mail class="h-4 w-4 text-gray-500" />
              <Field id="identifier" name="identifier" type="text" autocomplete="username"
                placeholder="nama@email.com atau username"
                class="h-14 w-full bg-transparent text-sm outline-none placeholder:text-gray-400" />
            </div>
            <ErrorMessage name="identifier" class="text-sm text-red-600" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700" for="password">Password</label>
            <div
              class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-blue-600">
              <LockKeyhole class="h-4 w-4 text-gray-500" />
              <Field id="password" name="password" :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password" placeholder="Masukkan password"
                class="h-14 w-full bg-transparent text-sm outline-none placeholder:text-gray-400" />
              <button type="button" class="text-gray-500 transition hover:text-gray-700"
                @click="showPassword = !showPassword">
                <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
              </button>
            </div>
            <ErrorMessage name="password" class="text-sm text-red-600" />
          </div>

          <p v-if="error" class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {{ error }}
          </p>

          <button type="submit"
            class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            :disabled="isLoading">
            <LoaderCircle v-if="isLoading" class="h-4 w-4 animate-spin" />
            <span>{{ isLoading ? "Memproses..." : "Masuk" }}</span>
          </button>
        </Form>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { ErrorMessage, Field, Form } from "vee-validate"
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-vue-next"
import { z } from "zod"

import { useAppToast } from "@/presentation/components/feedback/useAppToast"
import { useAuthViewModel } from "@/viewmodels/useAuthViewModel"

const router = useRouter()
const { error, isLoading, login } = useAuthViewModel()
const appToast = useAppToast()

const showPassword = ref(false)

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Email atau username wajib diisi."),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter."),
})

async function onSubmit(values: Record<string, unknown>, actions: { setErrors: (errors: Record<string, string>) => void }) {
  const parsed = loginSchema.safeParse(values)

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    actions.setErrors({
      identifier: fieldErrors.identifier?.[0] ?? "",
      password: fieldErrors.password?.[0] ?? "",
    })
    return
  }

  try {
    await login(parsed.data)
    appToast.success("Login berhasil.")
    await router.push({ name: "dashboard" })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login gagal."
    appToast.error(message)
  }
}
</script>
