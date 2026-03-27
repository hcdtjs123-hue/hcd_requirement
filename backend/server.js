import "dotenv/config"
import cors from "cors"
import express from "express"
import nodemailer from "nodemailer"
import { createClient } from "@supabase/supabase-js"
import crypto from "node:crypto"

const app = express()
const PORT = Number(process.env.PORT) || 3847

const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const API_SECRET = process.env.API_SECRET
const PUBLIC_APP_URL = (process.env.PUBLIC_APP_URL || "http://localhost:5173").replace(/\/$/, "")
const PUBLIC_API_URL = (process.env.PUBLIC_API_URL || `http://localhost:${PORT}`).replace(/\/$/, "")

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null

let transporter = null
function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP_USER and SMTP_PASS must be set")
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return transporter
}

function requireApiSecret(req, res, next) {
  const key = req.header("x-api-key")
  if (!API_SECRET || key !== API_SECRET) {
    return res.status(401).json({ ok: false, error: "Unauthorized" })
  }
  next()
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0
}

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateSendEmailBody(body) {
  const errors = []
  if (!body || typeof body !== "object") {
    return ["Invalid JSON body"]
  }
  const { to, subject, html } = body
  if (!isNonEmptyString(to) || !emailRx.test(to.trim())) {
    errors.push("to must be a valid email")
  }
  if (!isNonEmptyString(subject)) {
    errors.push("subject is required")
  }
  if (!isNonEmptyString(html)) {
    errors.push("html is required")
  }
  return errors
}

function validateIssueBody(body) {
  const errors = []
  if (!body || typeof body !== "object") {
    return ["Invalid JSON body"]
  }
  const { applicationId, to, candidateName, position, expiresInHours } = body
  if (!isNonEmptyString(applicationId)) {
    errors.push("applicationId is required")
  } else if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      applicationId.trim(),
    )
  ) {
    errors.push("applicationId must be a UUID")
  }
  if (!isNonEmptyString(to) || !emailRx.test(to.trim())) {
    errors.push("to must be a valid email")
  }
  if (!isNonEmptyString(candidateName)) {
    errors.push("candidateName is required")
  }
  if (position !== undefined && position !== null && typeof position !== "string") {
    errors.push("position must be a string when provided")
  }
  if (
    expiresInHours !== undefined &&
    expiresInHours !== null &&
    (typeof expiresInHours !== "number" || !Number.isFinite(expiresInHours) || expiresInHours <= 0)
  ) {
    errors.push("expiresInHours must be a positive number when provided")
  }
  return errors
}

function randomToken() {
  return crypto.randomBytes(32).toString("hex")
}

function buildCandidateApprovalHtml({ candidateName, position, approveUrl, rejectUrl, expiresAt }) {
  const pos = position ? `<p><strong>Posisi:</strong> ${escapeHtml(position)}</p>` : ""
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Keputusan kandidat</title>
</head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px;">Keputusan screening kandidat</h1>
    <p>Halo,</p>
    <p>Mohon putuskan kandidat berikut:</p>
    <p><strong>Nama:</strong> ${escapeHtml(candidateName)}</p>
    ${pos}
    <p style="font-size: 14px; color: #555;">Link berlaku sampai: <strong>${escapeHtml(expiresAt)}</strong></p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td style="padding-right: 12px;">
          <a href="${approveUrl}" style="display: inline-block; background: #16a34a; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">Approve</a>
        </td>
        <td>
          <a href="${rejectUrl}" style="display: inline-block; background: #dc2626; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">Reject</a>
        </td>
      </tr>
    </table>
    <p style="font-size: 13px; color: #666;">Jika Anda tidak mengharapkan email ini, abaikan pesan ini.</p>
  </div>
</body>
</html>`
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
  }),
)
app.use(express.json({ limit: "2mb" }))

app.get("/health", (_req, res) => {
  res.json({ ok: true })
})

app.post("/send-email", requireApiSecret, async (req, res) => {
  try {
    const errs = validateSendEmailBody(req.body)
    if (errs.length) {
      return res.status(400).json({ ok: false, error: errs.join("; ") })
    }
    const { to, subject, html } = req.body
    const transport = getTransporter()
    await transport.sendMail({
      from: `"Recruitment" <${SMTP_USER}>`,
      to: to.trim(),
      subject: subject.trim(),
      html: html.trim(),
    })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    })
  }
})

app.post("/candidate-approval/issue", requireApiSecret, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ ok: false, error: "Supabase is not configured" })
    }
    const errs = validateIssueBody(req.body)
    if (errs.length) {
      return res.status(400).json({ ok: false, error: errs.join("; ") })
    }
    const {
      applicationId,
      to,
      candidateName,
      position,
      expiresInHours = 72,
    } = req.body

    const hours = typeof expiresInHours === "number" && expiresInHours > 0 ? expiresInHours : 72
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000)
    const approveToken = randomToken()
    const rejectToken = randomToken()

    const { data: inserted, error: insertError } = await supabase
      .from("candidate_hr_approval_tokens")
      .insert({
        application_id: applicationId.trim(),
        approve_token: approveToken,
        reject_token: rejectToken,
        expires_at: expiresAt.toISOString(),
        outcome: "pending",
      })
      .select("id")
      .single()

    if (insertError || !inserted) {
      console.error(insertError)
      return res.status(400).json({
        ok: false,
        error: insertError?.message || "Failed to create approval tokens",
      })
    }

    const approveUrl = `${PUBLIC_API_URL}/candidate-approval/approve/${encodeURIComponent(approveToken)}`
    const rejectUrl = `${PUBLIC_API_URL}/candidate-approval/reject/${encodeURIComponent(rejectToken)}`
    const expiresLabel = expiresAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })

    const html = buildCandidateApprovalHtml({
      candidateName: String(candidateName).trim(),
      position: position != null ? String(position).trim() || null : null,
      approveUrl,
      rejectUrl,
      expiresAt: expiresLabel,
    })

    const transport = getTransporter()
    await transport.sendMail({
      from: `"Recruitment" <${SMTP_USER}>`,
      to: to.trim(),
      subject: `Keputusan kandidat: ${String(candidateName).trim()}`,
      html,
    })

    res.json({
      ok: true,
      tokenRequestId: inserted.id,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : "Failed to issue candidate approval email",
    })
  }
})

async function processDecision(token, decision, res) {
  try {
    if (!supabase) {
      return res.status(500).send("Server misconfigured")
    }
    if (!isNonEmptyString(token)) {
      return res.redirect(
        `${PUBLIC_APP_URL}/candidate-decision?outcome=error&message=${encodeURIComponent("Token tidak valid")}`,
      )
    }

    const col = decision === "approve" ? "approve_token" : "reject_token"
    const { data: row, error: fetchError } = await supabase
      .from("candidate_hr_approval_tokens")
      .select("id, application_id, expires_at, outcome")
      .eq(col, token.trim())
      .maybeSingle()

    if (fetchError || !row) {
      return res.redirect(
        `${PUBLIC_APP_URL}/candidate-decision?outcome=error&message=${encodeURIComponent("Link tidak valid")}`,
      )
    }

    if (row.outcome !== "pending") {
      return res.redirect(
        `${PUBLIC_APP_URL}/candidate-decision?outcome=used&previous=${encodeURIComponent(row.outcome)}`,
      )
    }

    const exp = new Date(row.expires_at).getTime()
    if (Number.isFinite(exp) && Date.now() > exp) {
      return res.redirect(
        `${PUBLIC_APP_URL}/candidate-decision?outcome=expired&message=${encodeURIComponent("Link sudah kedaluwarsa")}`,
      )
    }

    const screening = decision === "approve" ? "hr_approved" : "hr_rejected"
    const decidedAt = new Date().toISOString()

    const { error: appError } = await supabase
      .from("candidate_form")
      .update({
        hr_screening_status: screening,
        updated_at: decidedAt,
      })
      .eq("id", row.application_id)

    if (appError) {
      console.error(appError)
      return res.redirect(
        `${PUBLIC_APP_URL}/candidate-decision?outcome=error&message=${encodeURIComponent("Gagal memperbarui data kandidat")}`,
      )
    }

    const { error: tokError } = await supabase
      .from("candidate_hr_approval_tokens")
      .update({
        outcome: decision === "approve" ? "approved" : "rejected",
        decided_at: decidedAt,
      })
      .eq("id", row.id)
      .eq("outcome", "pending")

    if (tokError) {
      console.error(tokError)
      return res.redirect(
        `${PUBLIC_APP_URL}/candidate-decision?outcome=error&message=${encodeURIComponent("Gagal menyimpan keputusan")}`,
      )
    }

    const outcomeParam = decision === "approve" ? "approved" : "rejected"
    return res.redirect(`${PUBLIC_APP_URL}/candidate-decision?outcome=${outcomeParam}`)
  } catch (err) {
    console.error(err)
    return res.redirect(
      `${PUBLIC_APP_URL}/candidate-decision?outcome=error&message=${encodeURIComponent("Terjadi kesalahan")}`,
    )
  }
}

app.get("/candidate-approval/approve/:token", (req, res) => {
  processDecision(req.params.token, "approve", res)
})

app.get("/candidate-approval/reject/:token", (req, res) => {
  processDecision(req.params.token, "reject", res)
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({
    ok: false,
    error: err instanceof Error ? err.message : "Internal Server Error",
  })
})

app.listen(PORT, () => {
  console.log(`Email API listening on :${PORT}`)
})
