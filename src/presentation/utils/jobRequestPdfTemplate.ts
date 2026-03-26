import type { JobRequest } from '@/domain/entities/JobRequest'

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function lineValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return escapeHtml(value)
}

function nameOnly(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return escapeHtml(String(value).split(' — ')[0]?.trim() || String(value))
}

function buildRow(label: string, value: string, multiline = false) {
  return `
    <div class="field-row">
      <div class="field-label">${escapeHtml(label)}</div>
      <div class="field-separator">:</div>
      <div class="field-value${multiline ? ' multiline' : ''}">${value}</div>
    </div>
  `
}

function buildTemplate(job: JobRequest) {
  const isClosed = job.status === 'closed'
  const isFullyApproved = Boolean(
    job.approval_director_bu_date && job.approval_gm_hrd_date && job.approval_director_hrd_date,
  )

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>WORKFORCE REQUIREMENT REQUEST FORM</title>
      <style>
        @page { size: A4; margin: 12mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          color: #111827;
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          background: #ffffff;
        }
        .sheet {
          width: 100%;
          border: 1px solid #111827;
          background: #ffffff;
        }
        .header {
          padding: 16px 22px 14px;
          border-bottom: 2px solid #111827;
          text-align: center;
        }
        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          letter-spacing: 0.04em;
        }
        .header p {
          margin: 4px 0 0;
          font-size: 11px;
          color: #475569;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 88px;
          padding: 4px 10px;
          border: 1px solid #111827;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .content {
          padding: 18px 22px 22px;
        }
        .section {
          margin-top: 20px;
        }
        .section:first-child {
          margin-top: 0;
        }
        .section-title {
          margin: 0 0 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #94a3b8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .field-row {
          display: grid;
          grid-template-columns: 165px 12px 1fr;
          gap: 6px;
          align-items: start;
          margin-top: 8px;
        }
        .field-label {
          font-weight: 700;
          color: #334155;
        }
        .field-separator {
          text-align: center;
          color: #334155;
        }
        .field-value {
          min-height: 20px;
          padding: 0 2px 3px;
          border-bottom: 1px solid #cbd5e1;
          color: #111827;
          word-break: break-word;
        }
        .field-value.multiline {
          min-height: 60px;
        }
        .full-width {
          margin-top: 8px;
        }
        .full-width .field-row {
          grid-template-columns: 165px 12px 1fr;
        }
        .closing-box {
          padding: 12px 14px;
          border: 1px solid #cbd5e1;
        }
        .signature-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin-top: 10px;
        }
        .signature-table td {
          border: 1px solid #111827;
          text-align: center;
          vertical-align: middle;
          padding: 8px;
        }
        .signature-group {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .signature-space {
          height: 96px;
          position: relative;
        }
        .signature-name {
          position: absolute;
          left: 8px;
          right: 8px;
          bottom: 10px;
          font-size: 11px;
          font-weight: 700;
        }
        .signature-role {
          font-size: 11px;
        }
        .approval-note {
          margin-top: 10px;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 10px;
          color: #334155;
          text-align: center;
        }
        .footer-note {
          margin-top: 18px;
          font-size: 10px;
          color: #475569;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
          <div class="header-top">
            <div class="status-badge">${escapeHtml(job.status || 'open')}</div>
            <div>
              <h1>WORKFORCE REQUIREMENT REQUEST FORM</h1>
              <p>Recruitment request document</p>
            </div>
            <div class="status-badge">HCD</div>
          </div>
        </div>

        <div class="content">
          <div class="section">
            <p class="section-title">Request Information</p>
            ${buildRow('Request Date', formatDate(job.created_at))}
            ${buildRow('Required Position', lineValue(job.main_position))}
            ${buildRow('Department', lineValue(job.department))}
            ${buildRow('Site', lineValue(job.site))}
            ${buildRow('Working Location', lineValue(job.working_location))}
            ${buildRow('Required Date', formatDate(job.required_date))}
            ${buildRow('Employment Status', lineValue(job.employment_status))}
            ${buildRow('Cost Center PT', lineValue(job.pt_pembebanan))}
            ${buildRow(
              'Probation Period',
              job.periode_probation ? `${escapeHtml(job.periode_probation)} months` : '-',
            )}
            ${buildRow('Direct Manager', nameOnly(job.direct_manager))}
            ${buildRow('GM HRD Approval', nameOnly(job.approval_gm_hrd))}
            ${buildRow('Director HRD Approval', nameOnly(job.approval_director_hrd))}
            ${buildRow('Manpower Requirement Category', lineValue(job.position_status))}
          </div>

          ${
            isClosed
              ? `
          <div class="section">
            <p class="section-title">Closing Information</p>
            <div class="closing-box">
              ${buildRow('Closed Category', lineValue(job.closed_category))}
              ${buildRow('Closed Date', formatDate(job.closed_date))}
              <div class="full-width">
                ${buildRow('Reason', lineValue(job.reason), true)}
              </div>
            </div>
          </div>`
              : ''
          }

          <div class="section">
            <p class="section-title">Signatures</p>
            <table class="signature-table">
              <tr>
                <td class="signature-group">Submitted by:</td>
                <td class="signature-group" colspan="3">Approved by:</td>
              </tr>
              <tr>
                <td class="signature-space">
                  <div class="signature-name">${nameOnly(job.created_by_name || job.direct_manager)}</div>
                </td>
                <td class="signature-space">
                  <div class="signature-name">${nameOnly(job.approval_director_bu)}</div>
                </td>
                <td class="signature-space">
                  <div class="signature-name">${nameOnly(job.approval_gm_hrd)}</div>
                </td>
                <td class="signature-space">
                  <div class="signature-name">${nameOnly(job.approval_director_hrd)}</div>
                </td>
              </tr>
              <tr>
                <td class="signature-role">Applicant</td>
                <td class="signature-role">BU Director</td>
                <td class="signature-role">GM HRD</td>
                <td class="signature-role">Director HRD</td>
              </tr>
            </table>
            ${
              isFullyApproved
                ? `
            <div class="approval-note">
              This document has been electronically approved through the HCD system by the designated approvers.
            </div>`
                : ''
            }
          </div>

          <div class="footer-note">
            Generated from HCD system on ${formatDate(new Date().toISOString())}
          </div>
        </div>
      </div>
      <script>
        window.addEventListener('load', () => {
          setTimeout(() => window.print(), 250)
        })
      </script>
    </body>
  </html>`
}

export function exportJobRequestPdf(job: JobRequest) {
  const printWindow = window.open('about:blank', '_blank', 'width=960,height=1200')

  if (!printWindow) {
    throw new Error('The PDF preview window could not be opened.')
  }

  printWindow.document.open()
  printWindow.document.write(buildTemplate(job))
  printWindow.document.close()
}
