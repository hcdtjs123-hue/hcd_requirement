# Penjelasan Schema dan Fungsinya di Aplikasi HCD

Dokumen ini merangkum fungsi tabel pada schema yang Anda kirim berdasarkan codebase aplikasi saat ini.

Dasar pembacaan:
- Schema database yang Anda lampirkan
- Routing aplikasi di `src/app/router/index.ts`
- Repository Supabase di `src/infrastructure/supabase/repositories/*`
- Backend email/public approval di `backend/server.js`

## 1. Gambaran Besar Aplikasi

Aplikasi HCD ini secara praktik terbagi menjadi 5 area utama:

1. ERF / Job Request
   Mengelola permintaan kebutuhan karyawan.
2. Approval
   Mengelola approval chain berjenjang untuk ERF.
3. Recruitment
   Menampilkan ERF yang sudah approved dan siap diproses recruitment.
4. Candidate Data
   Menyimpan form kandidat lengkap beserta detail pendidikan, keluarga, pengalaman kerja, dan personal statement.
5. User, Role, dan Master Data
   Mengelola akun user, role-permission, PT, department, dan custom group.

## 2. Fungsi Tiap Tabel

### A. Modul ERF / Job Request

#### `employee_request_form`
Tabel inti untuk ERF.

Fungsi di aplikasi:
- Menyimpan permintaan pembukaan posisi.
- Menjadi sumber data utama halaman daftar ERF, form create/edit ERF, dashboard, dan approval.
- Menjadi induk relasi untuk `approval_chains`, `candidate_form`, dan `recruitment_tracking`.

Contoh pemakaian di code:
- `JobRequestRepositoryImpl` membaca, membuat, update, delete, dan close ERF.
- `ApprovalRepositoryImpl` memakai tabel ini untuk mengaitkan chain approval dengan posisi yang diajukan.
- `RecruitmentTrackingRepositoryImpl` melakukan join ke ERF untuk menampilkan recruitment queue.

Kolom yang penting secara bisnis:
- `main_position`, `site`, `working_location`, `required_date`
- `approval_director_bu`, `approval_gm_hrd`, `approval_director_hrd`
- `status`, `closed_date`, `closed_category`, `reason`
- `pt_id`, `department_id`, `custom_grup_1_id` s.d. `custom_grup_6_id`

#### `recruitment_tracking`
Tabel penanda bahwa sebuah ERF telah selesai approval dan masuk ke antrean recruitment.

Fungsi di aplikasi:
- Menjadi data utama halaman `Hiring Dashboard`.
- Dibuat otomatis ketika seluruh `approval_steps` dalam satu chain selesai approve.

Contoh pemakaian di code:
- `ApprovalRepositoryImpl.approveStep()` otomatis insert ke `recruitment_tracking` ketika chain selesai.
- `RecruitmentTrackingRepositoryImpl` membaca tabel ini untuk halaman recruitment dashboard.

Catatan:
- Setelah cleanup pipeline, tabel ini tetap dipakai.
- Saat ini tabel ini tidak lagi dipakai untuk candidate invitation/interview pipeline.

### B. Modul Approval

#### `approval_chains`
Header approval untuk satu ERF.

Fungsi di aplikasi:
- Menyimpan status approval per ERF, misalnya `draft`, `pending`, `approved`, `rejected`.
- Menjadi induk dari `approval_steps`.

Contoh pemakaian di code:
- Dibuat saat ERF disubmit untuk approval.
- Ditampilkan di halaman approval tracking.
- Dipakai untuk menentukan kapan recruitment tracking boleh dibuat.

#### `approval_steps`
Detail tahapan approval di dalam satu chain.

Fungsi di aplikasi:
- Menyimpan urutan approver.
- Menyimpan token approval public.
- Menyimpan status tiap step: `pending`, `approved`, `rejected`.

Contoh pemakaian di code:
- `ApprovalRepositoryImpl.submitForApproval()` membuat langkah-langkah approval.
- `ApprovalRepositoryImpl.getStepByToken()` memuat step dari token public.
- `ApprovalRepositoryImpl.approveStep()` dan `rejectStep()` memperbarui status step.

#### `approver_master`
Master approver HR yang dipakai untuk menyusun approval chain.

Fungsi di aplikasi:
- Menentukan siapa GM HRD dan Director HRD berdasarkan `step_order`.
- Dikelola dari halaman `Approver Master`.

Contoh pemakaian di code:
- `ApprovalRepositoryImpl.submitForApproval()` membaca approver master untuk membentuk step 2 dan step 3.
- `JobRequestRepositoryImpl.create()` juga membaca approver master untuk auto-populate nama approver di ERF.

### C. Modul Candidate Data

#### `candidate_form`
Tabel utama data kandidat.

Fungsi di aplikasi:
- Menyimpan form kandidat lengkap.
- Menjadi pusat data candidate module.
- Menyimpan status screening HR lewat `hr_screening_status`.

Contoh pemakaian di code:
- `CandidateDataRepositoryImpl` memakai tabel ini untuk CRUD candidate.
- Backend `server.js` mengubah `hr_screening_status` ketika approval kandidat via email diproses.

Relasi penting:
- Ke `employee_request_form` lewat `job_request_id`
- Ke `profiles` lewat `candidate_id`
- Menjadi parent untuk `education`, `family_and_emergency`, `work_history`, `personal_statement`, dan `candidate_hr_approval_tokens`

#### `education`
Detail riwayat pendidikan kandidat.

Fungsi di aplikasi:
- Menyimpan daftar pendidikan kandidat sebagai data child dari `candidate_form`.

Contoh pemakaian di code:
- `CandidateDataRepositoryImpl.replaceEducation()` menghapus lalu insert ulang item pendidikan saat create/update candidate.

#### `family_and_emergency`
Data keluarga dan kontak darurat kandidat.

Fungsi di aplikasi:
- Menyimpan relasi keluarga dan informasi emergency contact dalam context form kandidat.

Contoh pemakaian di code:
- `CandidateDataRepositoryImpl.replaceFamilyEmergency()`

#### `work_history`
Riwayat pekerjaan kandidat.

Fungsi di aplikasi:
- Menyimpan pengalaman kerja, gaji terakhir, benefit, dan alasan keluar.

Contoh pemakaian di code:
- `CandidateDataRepositoryImpl.replaceWorkHistory()`

#### `personal_statement`
Pernyataan pribadi kandidat.

Fungsi di aplikasi:
- Menyimpan preferensi kontrak, kesediaan business trip, ekspektasi gaji, legal issues, dan informasi personal lain.

Contoh pemakaian di code:
- `CandidateDataRepositoryImpl.upsertPersonalStatement()`

#### `candidate_hr_approval_tokens`
Tabel token keputusan screening kandidat lewat email/public link.

Fungsi di aplikasi:
- Menyimpan token approve/reject kandidat.
- Menyimpan masa berlaku token, outcome, dan waktu keputusan.

Contoh pemakaian di code:
- `backend/server.js` endpoint `/candidate-approval/issue`
- `backend/server.js` endpoint `/candidate-approval/approve/:token`
- `backend/server.js` endpoint `/candidate-approval/reject/:token`

Catatan:
- Tabel ini dipakai oleh backend email/public flow, bukan halaman CRUD biasa.
- Tabel ini berhubungan langsung ke `candidate_form`, bukan ke modul recruitment pipeline lagi.

### D. Modul Recruitment

#### `recruitment_tracking`
Sudah dijelaskan di bagian ERF, tetapi secara modul recruitment tabel ini adalah titik awal halaman recruitment.

Fungsi di aplikasi:
- Menampilkan daftar posisi/ERF yang sudah approved penuh dan siap ditangani tim recruitment.

Catatan penting:
- `candidate_invitations` dan `interview_schedules` tidak ada lagi pada schema ini, dan memang sudah dibersihkan dari runtime code aplikasi.
- Artinya modul recruitment sekarang fokus pada queue ERF siap diproses, bukan pipeline kandidat per invitation/interview.

### E. Modul User, Auth, Role, Permission

#### `profiles`
Tabel profil user publik yang mereferensikan `auth.users`.

Fungsi di aplikasi:
- Menjadi sumber data profil user, nama lengkap, username, phone, dan email tampilan.
- Dipakai lintas modul: approver, candidate owner, creator ERF, candidate account, dan user management.

Contoh pemakaian di code:
- `UserManagementRepositoryImpl`
- `ApprovalRepositoryImpl` join ke `profiles`
- `JobRequestRepositoryImpl` ambil nama creator
- `AuthRepositoryImpl` resolve login via username dari `profiles`

#### `roles`
Master role aplikasi.

Fungsi di aplikasi:
- Menentukan kategori user seperti admin, manager, candidate, dan role lain.

Contoh pemakaian di code:
- `RoleRepositoryImpl`
- `UserManagementRepositoryImpl.getRoles()`

#### `permissions`
Master permission granular.

Fungsi di aplikasi:
- Menentukan hak akses per modul, misalnya `job_request:read`, `approval:read`, `candidate_data:update`, `role:manage`.

Contoh pemakaian di code:
- `RoleRepositoryImpl.getAllPermissions()`
- Navigation guard router memeriksa permission untuk mengakses halaman.

Catatan:
- Repository role juga memastikan beberapa permission wajib tersedia otomatis.

#### `role_permissions`
Tabel penghubung many-to-many antara role dan permission.

Fungsi di aplikasi:
- Menentukan permission apa saja yang dimiliki sebuah role.

Contoh pemakaian di code:
- `RoleRepositoryImpl.getAllRoles()` join ke `role_permissions(permissions(...))`
- `RoleRepositoryImpl.updateRolePermissions()` reset dan insert mapping baru

#### `user_roles`
Tabel penghubung user dengan role.

Fungsi di aplikasi:
- Menentukan role aktif tiap user.
- Dipakai untuk filtering akses manager/candidate/staff di berbagai repository.

Contoh pemakaian di code:
- `CandidateDataRepositoryImpl.getAccessScope()`
- `JobRequestRepositoryImpl.getAccessScope()`
- `UserManagementRepositoryImpl`

### F. Modul Master Data

#### `master_pt`
Master PT / perusahaan.

Fungsi di aplikasi:
- Menjadi lookup PT pada ERF.
- Dikelola dari halaman master data.

Contoh pemakaian di code:
- `MasterDataRepositoryImpl`
- `JobRequestRepositoryImpl` resolve `pt_id` dari nama PT

#### `master_department`
Master department.

Fungsi di aplikasi:
- Menjadi lookup department pada ERF.
- Dikelola dari halaman master data.

Contoh pemakaian di code:
- `MasterDataRepositoryImpl`
- `JobRequestRepositoryImpl` resolve `department_id`

#### `master_custom_grup_1` s.d. `master_custom_grup_6`
Enam tabel master custom group untuk struktur tambahan di ERF.

Fungsi di aplikasi:
- Menjadi lookup nilai custom group yang dipakai pada ERF.
- Dikelola dari halaman `Custom Groups`.

Contoh pemakaian di code:
- `CustomGroupRepositoryImpl`
- `JobRequestRepositoryImpl` join nama custom group saat baca ERF
- `ApprovalRepositoryImpl` ikut menampilkan nama custom group saat detail approval

## 3. Tabel yang Dipakai Langsung vs Tidak Langsung

### Dipakai langsung oleh halaman utama / repository
- `employee_request_form`
- `approval_chains`
- `approval_steps`
- `approver_master`
- `candidate_form`
- `education`
- `family_and_emergency`
- `work_history`
- `personal_statement`
- `recruitment_tracking`
- `profiles`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`
- `master_pt`
- `master_department`
- `master_custom_grup_1` s.d. `master_custom_grup_6`

### Dipakai oleh backend / public flow khusus
- `candidate_hr_approval_tokens`

## 4. Relasi Penting yang Membentuk Alur Bisnis

### Alur ERF ke Approval ke Recruitment
1. User membuat data di `employee_request_form`
2. Sistem membuat `approval_chains`
3. Sistem membuat `approval_steps`
4. Approver menyetujui step-step tersebut
5. Setelah semua step approved, sistem membuat `recruitment_tracking`

### Alur Candidate Data
1. Kandidat atau admin mengisi `candidate_form`
2. Detail pendukung disimpan di:
   - `education`
   - `family_and_emergency`
   - `work_history`
   - `personal_statement`
3. Jika dipakai flow screening email, backend membuat `candidate_hr_approval_tokens`
4. Approve/reject dari email akan mengubah `candidate_form.hr_screening_status`

### Alur Auth dan Hak Akses
1. Akun auth ada di `auth.users`
2. Profil publik ada di `profiles`
3. Role user disimpan di `user_roles`
4. Definisi role ada di `roles`
5. Permission role disimpan di `role_permissions`
6. Daftar permission ada di `permissions`

## 5. Catatan Penting tentang Codebase Saat Ini

- Modul hiring pipeline kandidat berbasis invitation/interview sudah tidak aktif lagi di runtime aplikasi.
- Schema yang Anda kirim memang sudah konsisten dengan kondisi itu karena tidak lagi memuat `candidate_invitations` dan `interview_schedules`.
- `deleted_at` dan `deleted_by` ada di beberapa tabel, tetapi pada code saat ini banyak operasi delete masih dilakukan sebagai hard delete biasa, bukan soft delete penuh.
- `profiles` sangat sentral karena hampir semua modul akhirnya bergantung pada identitas user dari tabel ini.

## 6. Ringkasan Singkat per Modul

- ERF: `employee_request_form`
- Approval: `approval_chains`, `approval_steps`, `approver_master`
- Recruitment queue: `recruitment_tracking`
- Candidate: `candidate_form`, `education`, `family_and_emergency`, `work_history`, `personal_statement`, `candidate_hr_approval_tokens`
- User & Auth: `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`
- Master Data: `master_pt`, `master_department`, `master_custom_grup_1` s.d. `master_custom_grup_6`

## 7. Penjelasan Sederhana untuk Atasan

Bagian ini dibuat khusus supaya mudah menjawab saat ditanya fungsi tabel tanpa harus menjelaskan detail teknis coding.

### `approver_master`

Ini adalah tabel master daftar approver.

Bahasa sederhananya:
- Tabel ini berisi siapa saja orang yang menjadi approver tetap.
- Sistem membaca tabel ini saat membuat alur approval ERF.
- Di project ini, approver utama yang diambil dari sini adalah GM HRD dan Director HRD berdasarkan `step_order`.

Kalimat singkat yang bisa dipakai:
- `approver_master` adalah daftar master siapa yang berhak menjadi approver dalam proses approval ERF.

### `approval_chains`

Ini adalah header atau kepala dokumen approval.

Bahasa sederhananya:
- Satu ERF punya satu proses approval.
- Proses approval itu disimpan di `approval_chains`.
- Jadi tabel ini menunjukkan satu ERF sedang ada di approval mana, statusnya apa, dan siapa pembuat chain-nya.

Contoh bayangan:
- Ada ERF untuk posisi `Supervisor`.
- Saat ERF itu disubmit, sistem membuat satu baris di `approval_chains`.
- Baris itu menjadi wadah semua langkah approval untuk ERF tersebut.

Kalimat singkat yang bisa dipakai:
- `approval_chains` adalah data approval utama untuk satu ERF.

### `approval_steps`

Ini adalah detail langkah-langkah approval di dalam satu chain.

Bahasa sederhananya:
- Kalau `approval_chains` itu kepala approval, maka `approval_steps` adalah isi urutannya.
- Misalnya approval harus lewat 3 orang:
  1. BU Director
  2. GM HRD
  3. Director HRD
- Maka sistem membuat 3 baris di `approval_steps`.

Setiap baris menyimpan:
- urutan approval,
- email approver,
- nama approver,
- status approve/reject,
- waktu approve,
- token link approval public.

Kalimat singkat yang bisa dipakai:
- `approval_steps` adalah daftar tahapan approval yang harus dilalui ERF satu per satu.

### Hubungan `approver_master`, `approval_chains`, dan `approval_steps`

Supaya paling mudah dipahami:

- `approver_master` = daftar orangnya
- `approval_chains` = dokumen approval untuk 1 ERF
- `approval_steps` = urutan orang yang harus approve di dokumen itu

Alurnya:
1. User membuat ERF
2. ERF disubmit untuk approval
3. Sistem membaca `approver_master`
4. Sistem membuat `approval_chains`
5. Sistem membuat beberapa `approval_steps`
6. Approver approve satu per satu sesuai urutan
7. Jika semua approve, ERF masuk ke `recruitment_tracking`

Kalimat versi rapat:
- `approver_master` menentukan siapa approver-nya, `approval_chains` menyimpan approval per ERF, dan `approval_steps` menyimpan urutan langkah approvalnya.

### `candidate_hr_approval_tokens`

Ini bukan approval ERF.
Ini dipakai untuk keputusan kandidat melalui link email.

Bahasa sederhananya:
- Saat HR ingin meminta keputusan approve/reject untuk kandidat, sistem membuat token.
- Token itu dimasukkan ke link email.
- Saat link dibuka, sistem tahu kandidat mana yang sedang diproses.
- Setelah diklik approve atau reject, status kandidat di `candidate_form.hr_screening_status` diubah.

Isi yang disimpan tabel ini:
- kandidat mana yang dimaksud lewat `application_id`
- token approve
- token reject
- masa berlaku link
- hasil akhirnya: `pending`, `approved`, atau `rejected`

Kalimat singkat yang bisa dipakai:
- `candidate_hr_approval_tokens` adalah tabel token link email untuk approve atau reject kandidat.

### Bedanya Approval ERF vs Approval Kandidat

Ini yang sering bikin bingung:

- `approval_chains` dan `approval_steps` dipakai untuk approval ERF.
- `candidate_hr_approval_tokens` dipakai untuk keputusan kandidat.

Jadi:
- ERF approval = proses persetujuan pembukaan posisi
- Candidate approval = proses keputusan screening kandidat

### Jawaban Super Singkat yang Aman Dipakai

Kalau ditanya cepat oleh atasan, Anda bisa jawab begini:

- `approver_master` adalah master daftar approver.
- `approval_chains` adalah header approval untuk satu ERF.
- `approval_steps` adalah urutan langkah approval di dalam ERF itu.
- `candidate_hr_approval_tokens` adalah token email untuk approve atau reject kandidat.

### Contoh Penjelasan 30 Detik

“Di sistem ini ada dua jenis approval. Pertama, approval ERF. Untuk itu dipakai `approver_master` sebagai daftar approver, `approval_chains` sebagai data approval per ERF, dan `approval_steps` sebagai urutan approvalnya. Kedua, approval kandidat. Untuk itu dipakai `candidate_hr_approval_tokens`, yaitu token link email untuk approve atau reject kandidat.”

## 8. Menjawab Pertanyaan: “Bukannya Sudah Cukup Lihat Approve By/Date di `employee_request_form`?”

Jawabannya:
- Untuk membaca hasil akhir approval secara cepat, iya, cukup lihat kolom approval di `employee_request_form`.
- Tetapi untuk proses approval yang sebenarnya, sistem tetap memakai `approval_chains` dan `approval_steps`.

Jadi dua-duanya benar, hanya fungsinya berbeda.

### Yang Ada di `employee_request_form`

Di tabel `employee_request_form` ada kolom:
- `approval_director_bu`
- `approval_director_bu_date`
- `approval_gm_hrd`
- `approval_gm_hrd_date`
- `approval_director_hrd`
- `approval_director_hrd_date`

Kolom-kolom ini dipakai sebagai ringkasan hasil approval.

Manfaatnya:
- mudah dibaca di list ERF
- mudah dibuat report
- tidak perlu join ke tabel approval detail untuk tampilan sederhana

Di UI saat ini, daftar ERF memang membaca kolom summary ini langsung.

### Yang Ada di `approval_chains` dan `approval_steps`

Ini adalah data proses approval yang sebenarnya.

Fungsinya:
- menyimpan approval per ERF
- menyimpan urutan step approval
- menyimpan status setiap step
- menyimpan token public approval
- menyimpan log siapa approve dan kapan
- menentukan apakah approval masih pending, approved, atau rejected

Jadi:
- `employee_request_form` = hasil ringkas
- `approval_chains` + `approval_steps` = mesin workflow dan detail proses

### Kenapa Tidak Cukup `employee_request_form` Saja?

Kalau hanya ada kolom approve by/date di `employee_request_form`, sistem akan sulit untuk:
- tahu approval sedang berhenti di step mana
- tahu siapa approver berikutnya
- menyimpan token approval public
- menyimpan status per langkah
- menolak approval yang lompat urutan
- mencatat detail approval secara lebih rapi

Artinya:
- kolom di `employee_request_form` bagus untuk tampilan cepat
- tapi tidak cukup untuk menjalankan workflow approval lengkap

### Hubungan Nyatanya di Sistem

Di aplikasi ini, saat satu step approval selesai:
- sistem update `approval_steps`
- lalu sistem sinkronkan ringkasan hasilnya ke `employee_request_form`

Jadi kolom di `employee_request_form` bukan pengganti workflow, tetapi hasil sinkronisasi dari workflow approval.

Bahasa sederhananya:
- approval aslinya terjadi di `approval_steps`
- hasil akhirnya dicatat juga di `employee_request_form`

### Kalimat Aman untuk Menjawab Atasan

Kalau ditanya lagi, jawaban yang aman:

“Betul Pak/Bu, untuk lihat hasil approval cepat memang cukup dari kolom approve by/date di `employee_request_form`. Tapi secara sistem, proses approval aslinya tetap berjalan di `approval_chains` dan `approval_steps`. Kolom di `employee_request_form` itu ringkasan atau snapshot hasil approval supaya lebih mudah dibaca di daftar ERF dan report.”

### Jawaban Singkat Versi Praktis

- `employee_request_form` dipakai untuk lihat hasil approval secara cepat.
- `approval_chains` dan `approval_steps` dipakai untuk menjalankan proses approvalnya.
- Jadi satu untuk summary, satu untuk workflow detail.

## 9. Kalau Dibantah: “Bukannya Semua Itu Bisa Dicek dari Date di `employee_request_form`?”

Pertanyaan itu valid.
Jawaban yang paling aman adalah: bisa, tapi tergantung kebutuhan sistem.

### Jawaban yang Jujur dan Aman

Kalau approval di perusahaan memang:
- step-nya tetap,
- jumlah approver-nya tetap,
- tidak ada kebutuhan workflow rumit,
- tidak perlu histori detail yang kompleks,

maka memang ada kemungkinan desain approval cukup disimpan di `employee_request_form`.

Artinya:
- dari kolom date bisa dilihat approval sudah sampai step mana,
- dari urutan tetap bisa ditebak siapa approver berikutnya,
- notes/status/token juga secara teori bisa ditambahkan sebagai kolom tambahan di ERF.

Jadi kalau ada yang bilang:
- “Ini sebenarnya bisa disederhanakan ke `employee_request_form` saja”

itu bukan pernyataan yang salah.

### Yang Lebih Tepat Dijelaskan

Yang benar bukan:
- `employee_request_form` pasti tidak bisa

Tetapi:
- `employee_request_form` bisa dipakai kalau approval-nya sederhana dan fixed
- `approval_chains` dan `approval_steps` lebih cocok kalau approval ingin dibuat lebih rapi, fleksibel, dan mudah dikembangkan

### Kalau Hanya Pakai `employee_request_form`, Apa Masih Bisa?

Jawabannya: banyak yang masih bisa.

Contohnya:
- tahu approval sedang di step berapa
  Bisa dengan melihat kolom date mana yang sudah terisi.
- tahu approver berikutnya
  Bisa kalau urutan approver memang tetap.
- simpan status per langkah
  Bisa, kalau ditambah kolom status per step.
- simpan notes per langkah
  Bisa, kalau ditambah kolom notes per step.
- simpan token public approval
  Bisa, kalau ditambah kolom token per step.
- mencegah chain aktif ganda
  Bisa, tapi logikanya akan dipusatkan di ERF dan jadi lebih “custom”.

Jadi inti bantahannya memang masuk akal:
- secara teknis, banyak hal itu masih bisa dilakukan hanya dengan `employee_request_form`

### Lalu Kenapa Masih Dipisah ke `approval_chains` dan `approval_steps`?

Karena desain terpisah biasanya lebih enak untuk jangka panjang.

Keuntungannya:
- lebih rapi karena summary dipisah dari workflow
- lebih mudah kalau jumlah step berubah
- lebih mudah kalau suatu hari approver tidak lagi cuma 3 tahap
- lebih mudah membuat approval tracking
- lebih cocok untuk histori approval
- lebih reusable kalau nanti konsep approval dipakai untuk modul lain

Jadi desain sekarang lebih ke arah:
- bukan karena satu-satunya cara
- tapi karena lebih scalable dan lebih bersih secara struktur

### Cara Menjawab ke Atasan Tanpa Terkesan Membantah

Kalau ditanya seperti itu, jawaban aman:

“Betul Pak/Bu, kalau approval flow-nya sederhana dan tetap, sebenarnya banyak informasi approval memang bisa dibaca dari `employee_request_form`, terutama dari kolom approve by/date. Jadi dari sisi tampilan dan summary itu sudah cukup. Hanya saja desain sekarang memisahkan workflow approval ke `approval_chains` dan `approval_steps` supaya prosesnya lebih rapi dan lebih mudah dikembangkan kalau nanti alurnya berubah.”

### Versi Singkat yang Bisa Dipakai Langsung

“Iya Pak/Bu, sebenarnya bisa disederhanakan ke `employee_request_form` kalau alurnya fixed. Tapi di desain sekarang, `employee_request_form` dipakai sebagai summary, sedangkan `approval_chains` dan `approval_steps` dipakai untuk workflow detailnya.”

### Kesimpulan Praktis

- Atasan Anda tidak salah kalau melihat dari sisi kebutuhan yang sederhana.
- Struktur tabel terpisah juga tidak salah, karena itu pendekatan yang lebih fleksibel.
- Jadi ini bukan soal benar atau salah mutlak, tetapi soal pilihan desain:
  - sederhana dan fixed: cukup di `employee_request_form`
  - lebih rapi dan siap berkembang: pakai `approval_chains` dan `approval_steps`
