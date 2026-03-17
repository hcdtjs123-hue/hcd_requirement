import { toast } from "vue-sonner"

export function useAppToast() {
  function success(message: string) {
    toast.success(message)
  }

  function error(message: string) {
    toast.error(message)
  }

  function created(subject: string) {
    success(`${subject} berhasil dibuat.`)
  }

  function updated(subject: string) {
    success(`${subject} berhasil diperbarui.`)
  }

  function deleted(subject: string) {
    success(`${subject} berhasil dihapus.`)
  }

  return {
    created,
    deleted,
    error,
    success,
    updated,
  }
}
