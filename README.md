# HCD (Human Capital Development)

Sistem Web Application untuk mengelola rekrutmen, persetujuan (approval chains), manajemen user, dan manajemen peran (role) dalam organisasi.

---

## 🚀 Fitur Utama

- **Manajemen Job Request**: Pembuatan, pengajuan, dan pelacakan permintaan lowongan pekerjaan.
- **Approval System**: Alur persetujuan dinamis (Approval Chains) untuk berbagai entitas dalam sistem.
- **Recruitment Tracking**: Pelacakan proses seleksi dan rekrutmen kandidat secara *end-to-end*.
- **User & Role Management**: Pengelolaan akun administrator, tim HR, kandidat, serta kontrol hak akses granular berdasarkan Role.

## 🛠️ Tech Stack & Alat Pengembangan

Aplikasi ini dibangun menggunakan arsitektur modern (*Clean Architecture* - Domain, Use Cases) dengan *stack* utama:

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API) via [Vite](https://vitejs.dev/)
- **Bahasa Utama**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/) / [@tanstack/vue-query](https://tanstack.com/query/latest) (untuk manajemen status API)
- **Form & Validasi**: [Vee-Validate](https://vee-validate.logaretm.com/v4/) + [Zod](https://zod.dev/)
- **Backend / BaaS**: [Supabase](https://supabase.com/)
- **Testing**: [Vitest](https://vitest.dev/) untuk unit testing.
- **UI Icons**: [Lucide Vue Next](https://lucide.dev/)

---

## 💻 Panduan Menjalankan Project

### Prasyarat
Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) versi 20 atau yang lebih baru.

### 1. Instalasi
Salin repositori, kemudian instal semua dependensi menggunakan `npm`:
```bash
npm install
```

### 2. Mode Pengembangan (Development)
Jalankan server Vite untuk pengembangan fungsionalitas dengan dukungan _Hot-Module Replacement (HMR)_:
```bash
npm run dev
```

### 3. Build & Produksi
Untuk memeriksa tipe TypeScript dan melakukan kompilasi versi final yang telah diminify:
```bash
npm run build
```

### 4. Menjalankan Unit Test
Pastikan logika _Use Case_ atau _Domain_ berjalan dengan benar menggunakan Vitest:
```bash
npm run test:unit
```

### 5. Formatting Kode
Aplikasi ini sudah dikonfigurasi dengan Prettier untuk konsistensi penulisan gaya bahasa (*code styling*). Untuk merepihkan kode:
```bash
npm run format
```

---

## 🎨 Rekomendasi IDE
Kami merekomendasikan penggunaan **[VS Code](https://code.visualstudio.com/)** dengan ekstensi berikut:
* **[Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)** (pastikan Vetur *dinonaktifkan*)
* **Tailwind CSS IntelliSense**
* **Prettier - Code formatter**
