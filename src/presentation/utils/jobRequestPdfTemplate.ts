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
  if (!value) return '........................................'

  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function lineValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '........................................'
  }

  return escapeHtml(value)
}

function checkMark(active: boolean) {
  return active ? 'X' : '&nbsp;'
}

function buildRow(label: string, value: string) {
  return `
    <div class="field-row">
      <div class="field-label">${escapeHtml(label)}</div>
      <div class="field-separator">:</div>
      <div class="field-value">${value}</div>
    </div>
  `
}

function buildTemplate(job: JobRequest) {
  const positionStatus = (job.position_status ?? '').toLowerCase()
  const customGroups = [
    job.custom_grup_1,
    job.custom_grup_2,
    job.custom_grup_3,
    job.custom_grup_4,
    job.custom_grup_5,
    job.custom_grup_6,
  ]

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Formulir Permohonan Kebutuhan Tenaga Kerja</title>
      <style>
        @page { size: A4; margin: 14mm 12mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          color: #111827;
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.45;
        }
        .sheet { width: 100%; }
        .header {
          margin-bottom: 18px;
          border-top: 2px solid #111827;
          border-bottom: 2px solid #111827;
          padding: 10px 0 8px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 16px;
          letter-spacing: 0.04em;
        }
        .field-row {
          display: grid;
          grid-template-columns: 220px 16px 1fr;
          gap: 6px;
          margin-bottom: 8px;
          align-items: start;
        }
        .field-label { font-weight: 600; }
        .field-value {
          min-height: 18px;
          border-bottom: 1px solid #111827;
          padding: 0 4px 2px;
        }
        .section { margin-top: 18px; }
        .section-title {
          margin: 0 0 10px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px 20px;
          margin: 8px 0 12px;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .checkbox {
          display: inline-flex;
          width: 14px;
          height: 14px;
          align-items: center;
          justify-content: center;
          border: 1px solid #111827;
          font-size: 11px;
          font-weight: 700;
        }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .note {
          margin-top: 8px;
          color: #4b5563;
          font-size: 11px;
        }
        .signatures {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 28px;
        }
        .signature-card {
          min-height: 118px;
          border: 1px solid #111827;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .signature-title {
          font-weight: 700;
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #111827;
          padding-top: 6px;
          text-align: center;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
          <h1>FORMULIR PERMOHONAN KEBUTUHAN TENAGA KERJA</h1>
        </div>

        ${buildRow('Tanggal permohonan', formatDate(job.created_at))}
        ${buildRow('Posisi yang diperlukan', lineValue(job.main_position))}
        ${buildRow('Direct manager', lineValue(job.direct_manager))}
        ${buildRow('Approval Direktur BU', lineValue(job.approval_director_bu))}
        ${buildRow('Tanggal approval Direktur BU', formatDate(job.approval_director_bu_date))}
        ${buildRow('Approval GM HRD', lineValue(job.approval_gm_hrd))}
        ${buildRow('Tanggal approval GM HRD', formatDate(job.approval_gm_hrd_date))}
        ${buildRow('Approval Direktur HRD', lineValue(job.approval_director_hrd))}
        ${buildRow('Tanggal approval Direktur HRD', formatDate(job.approval_director_hrd_date))}
        ${buildRow('Site', lineValue(job.site))}
        ${buildRow('Working location', lineValue(job.working_location))}
        ${buildRow('Required date', formatDate(job.required_date))}
        ${buildRow('Employment status', lineValue(job.employment_status))}
        ${buildRow('PT pembebanan', lineValue(job.pt_pembebanan))}
        ${buildRow(
          'Periode probation',
          job.periode_probation ? `${escapeHtml(job.periode_probation)} bulan` : lineValue(''),
        )}

        <div class="section">
          <p class="section-title">Kategori kebutuhan tenaga kerja</p>
          <div class="checkbox-grid">
            <div class="checkbox-item"><span class="checkbox">${checkMark(positionStatus === 'posisi baru mpp')}</span><span>MPP</span></div>
            <div class="checkbox-item"><span class="checkbox">${checkMark(positionStatus === 'posisi baru non mpp')}</span><span>Non-MPP</span></div>
            <div class="checkbox-item"><span class="checkbox">${checkMark(positionStatus === 'pengganti')}</span><span>Pengganti</span></div>
            <div class="checkbox-item"><span class="checkbox">${checkMark(positionStatus === 'magang')}</span><span>Magang</span></div>
          </div>
          <p class="note">Current mapping is still provisional and follows the available fields in the application.</p>
        </div>

        <div class="section">
          <p class="section-title">Custom group / keterangan</p>
          <div class="two-col">
            <div>
              ${buildRow('Custom group 1', lineValue(customGroups[0]))}
              ${buildRow('Custom group 2', lineValue(customGroups[1]))}
              ${buildRow('Custom group 3', lineValue(customGroups[2]))}
            </div>
            <div>
              ${buildRow('Custom group 4', lineValue(customGroups[3]))}
              ${buildRow('Custom group 5', lineValue(customGroups[4]))}
              ${buildRow('Custom group 6', lineValue(customGroups[5]))}
            </div>
          </div>
        </div>

        <div class="section">
          <p class="section-title">Placeholder fields from template</p>
          ${buildRow('Alasan / business justification', lineValue(''))}
          ${buildRow('Kriteria kandidat', lineValue(''))}
          ${buildRow('Catatan budget controller', lineValue(''))}
        </div>

        <div class="signatures">
          <div class="signature-card">
            <div class="signature-title">Yang mengajukan</div>
            <div class="signature-line">${lineValue(job.direct_manager || '')}</div>
          </div>
          <div class="signature-card">
            <div class="signature-title">Diperiksa</div>
            <div class="signature-line">&nbsp;</div>
          </div>
          <div class="signature-card">
            <div class="signature-title">Disetujui</div>
            <div class="signature-line">&nbsp;</div>
          </div>
          <div class="signature-card">
            <div class="signature-title">Diketahui</div>
            <div class="signature-line">&nbsp;</div>
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
  const printableJob: JobRequest = {
    ...job,
    custom_grup_1: job.custom_grup_1 ?? null,
    custom_grup_2: job.custom_grup_2 ?? null,
    custom_grup_3: job.custom_grup_3 ?? null,
    custom_grup_4: job.custom_grup_4 ?? null,
    custom_grup_5: job.custom_grup_5 ?? null,
    custom_grup_6: job.custom_grup_6 ?? null,
  }

  const printWindow = window.open('about:blank', '_blank', 'width=960,height=1200')

  if (!printWindow) {
    throw new Error('The PDF preview window could not be opened.')
  }

  printWindow.document.open()
  printWindow.document.write(buildTemplate(printableJob))
  printWindow.document.close()
}
