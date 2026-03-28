import type { EmployeeRequestForm } from '@/domain/entities/EmployeeRequestForm'

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

  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
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

function buildApprovalItem(
  label: string,
  name: string | number | null | undefined,
  date: string | null | undefined,
) {
  return `
    <div class="approval-row">
      <div class="field-label">${escapeHtml(label)}</div>
      <div class="field-separator">:</div>
      <div class="approval-field-value">${nameOnly(name)}</div>
      <div class="field-label approval-date-title">Date</div>
      <div class="field-separator">:</div>
      <div class="approval-date-value">${escapeHtml(formatDate(date))}</div>
    </div>
  `
}

function buildPairedFieldRow(
  leftLabel: string,
  leftValue: string,
  rightLabel: string,
  rightValue: string,
) {
  return `
    <div class="paired-row">
      <div class="field-label">${escapeHtml(leftLabel)}</div>
      <div class="field-separator">:</div>
      <div class="paired-field-value">${leftValue}</div>
      <div class="field-label">${escapeHtml(rightLabel)}</div>
      <div class="field-separator">:</div>
      <div class="paired-field-value">${rightValue}</div>
    </div>
  `
}

function buildTemplate(job: EmployeeRequestForm) {
  const isClosed = job.status === 'closed'
  const isFullyApproved = Boolean(
    job.approval_director_bu_date && job.approval_gm_hrd_date && job.approval_director_hrd_date,
  )

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Employee Request Form (ERF)</title>
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
          justify-content: center;
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
        .approval-row {
          display: grid;
          grid-template-columns: 165px 12px minmax(180px, 260px) 42px 12px 1fr;
          gap: 6px;
          align-items: start;
          margin-top: 8px;
        }
        .paired-row {
          display: grid;
          grid-template-columns: 165px 12px minmax(140px, 1fr) 165px 12px minmax(140px, 1fr);
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
        .approval-field-value,
        .approval-date-value,
        .paired-field-value {
          min-height: 20px;
          padding: 0 2px 3px;
          border-bottom: 1px solid #cbd5e1;
          color: #111827;
          word-break: break-word;
        }
        .approval-date-title {
          text-align: right;
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
            <div>
              <h1>Employee Request Form (ERF)</h1>
              <p>Recruitment request document</p>
            </div>
          </div>
        </div>

        <div class="content">
          <div class="section">
            <p class="section-title">Request Information</p>
            ${buildRow('Request Date', formatDate(job.created_at))}
            ${buildRow('Required Position', lineValue(job.main_position))}
            ${buildRow('Department', lineValue(job.department))}
            ${buildRow('Job Level', lineValue(job.job_level))}
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
            ${buildRow('Manpower Requirement Category', lineValue(job.position_status))}
            ${buildPairedFieldRow(
              'Custom Group 1',
              lineValue(job.custom_grup_1),
              'Custom Group 2',
              lineValue(job.custom_grup_2),
            )}
            ${buildPairedFieldRow(
              'Custom Group 3',
              lineValue(job.custom_grup_3),
              'Custom Group 4',
              lineValue(job.custom_grup_4),
            )}
            ${buildPairedFieldRow(
              'Custom Group 5',
              lineValue(job.custom_grup_5),
              'Custom Group 6',
              lineValue(job.custom_grup_6),
            )}
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
            <p class="section-title">Sistem Approval</p>
            ${buildApprovalItem('Requester', job.created_by_name || job.direct_manager, job.created_at)}
            ${buildApprovalItem('BU Director', job.approval_director_bu, job.approval_director_bu_date)}
            ${buildApprovalItem('GM HRD', job.approval_gm_hrd, job.approval_gm_hrd_date)}
            ${buildApprovalItem('HR Director', job.approval_director_hrd, job.approval_director_hrd_date)}
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

export function exportEmployeeRequestFormPdf(job: EmployeeRequestForm) {
  const printWindow = window.open('about:blank', '_blank', 'width=960,height=1200')

  if (!printWindow) {
    throw new Error('The PDF preview window could not be opened.')
  }

  printWindow.document.open()
  printWindow.document.write(buildTemplate(job))
  printWindow.document.close()
}
