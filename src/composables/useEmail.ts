import { ref, type Ref } from "vue"

const emailApiUrl = (import.meta.env.VITE_EMAIL_API_URL || "").replace(/\/$/, "")
const emailApiKey = import.meta.env.VITE_EMAIL_API_KEY || ""

export interface SendEmailPayload {
  to: string
  subject: string
  html: string
}

export interface CandidateApprovalEmailPayload {
  applicationId: string
  to: string
  candidateName: string
  position?: string | null
  expiresInHours?: number
}

export function useEmail() {
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  async function sendEmail(payload: SendEmailPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      if (!emailApiUrl) {
        throw new Error("VITE_EMAIL_API_URL is not set")
      }
      if (!emailApiKey) {
        throw new Error("VITE_EMAIL_API_KEY is not set")
      }
      const res = await fetch(`${emailApiUrl}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": emailApiKey,
        },
        body: JSON.stringify({
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Failed to send email (${res.status})`)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to send email"
      throw e
    } finally {
      loading.value = false
    }
  }

  async function sendCandidateApprovalRequest(
    payload: CandidateApprovalEmailPayload,
  ): Promise<{ tokenRequestId: string; expiresAt: string }> {
    loading.value = true
    error.value = null
    try {
      if (!emailApiUrl) {
        throw new Error("VITE_EMAIL_API_URL is not set")
      }
      if (!emailApiKey) {
        throw new Error("VITE_EMAIL_API_KEY is not set")
      }
      const res = await fetch(`${emailApiUrl}/candidate-approval/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": emailApiKey,
        },
        body: JSON.stringify({
          applicationId: payload.applicationId,
          to: payload.to,
          candidateName: payload.candidateName,
          position: payload.position ?? null,
          expiresInHours: payload.expiresInHours,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        tokenRequestId?: string
        expiresAt?: string
      }
      if (!res.ok || !data.ok || !data.tokenRequestId || !data.expiresAt) {
        throw new Error(data.error || `Failed to send approval email (${res.status})`)
      }
      return { tokenRequestId: data.tokenRequestId, expiresAt: data.expiresAt }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to send approval email"
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    sendEmail,
    sendCandidateApprovalRequest,
  }
}
