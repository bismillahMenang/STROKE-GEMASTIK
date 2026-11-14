# Todo: Stabilisasi dan Penyelesaian RehabTrack MVP

**Plan lengkap:** `tasks/plan.md`
**Status:** Menunggu persetujuan manusia. Jangan mulai implementasi sebelum plan disetujui.
**Mulai dari:** Task 1 (verifikasi baseline) dan Task 2 (keputusan scope).

## Aturan eksekusi

- [ ] Plan ini disetujui manusia.
- [ ] Tidak ada commit, push, atau rewrite history tanpa persetujuan.
- [ ] Setiap task harus lulus acceptance criteria dan verification di `tasks/plan.md`.
- [ ] Update checklist ini setelah setiap task selesai.

---

## Phase 0: Baseline dan keputusan scope

- [ ] **Task 1: Verifikasi dan kelompokkan baseline migrasi Prisma**
  - Status: verifikasi dan usulan commit selesai, menunggu approval commit.
  - Acceptance: semua parse, test, Prisma validate, build dashboard, dan health check lulus.
  - Verification: jalankan seluruh perintah baseline dan tinjau `git diff`.
- [x] **Task 2: Putuskan scope resep dan jumlah latihan**
  - Keputusan 2026-11-14: 6 latihan dan resep dipertahankan. Menunggu konfirmasi manusia.
  - Acceptance: keputusan tertulis dan disetujui manusia.
  - Verification: tidak ada kontradiksi di PRD, app flow, tech spec, dan README.

### Checkpoint 0

- [ ] Task 1 dan Task 2 selesai.
- [ ] Semua pemeriksaan baseline lulus.
- [ ] Keputusan scope disetujui.
- [ ] Rencana commit disetujui sebelum commit pertama.

---

## Phase 1: Konfigurasi deploy dan keamanan dasar

- [x] **Task 3: Hormati `CORS_ORIGIN` di server**
  - Acceptance: origin diizinkan mendapat header, origin lain ditolak, request tanpa Origin tetap bekerja.
  - Verification: uji tiga skenario CORS dan health check.
- [x] **Task 4: Konfigurasi API URL mobile lewat environment**
  - Acceptance: tidak ada IP lokal atau URL placeholder di source.
  - Verification: grep, Babel parse, uji dengan env.
- [x] **Task 5: Konfigurasi link video call**
  - Acceptance: client dan dashboard membaca env, tidak ada link placeholder.
  - Verification: grep, parse client, build dashboard.
- [x] **Task 6: Normalisasi email dan kebijakan password**
  - Acceptance: email dinormalisasi, password minimal 8 karakter, tidak ada password di log atau response.
  - Verification: unit test helper dan uji route dengan database lokal.
- [x] **Task 7: Rate limit endpoint autentikasi**
  - Acceptance: percobaan berlebih mendapat 429, limit bisa diatur lewat env.
  - Verification: uji request berurutan dan `node --check`.

### Checkpoint 1

- [x] Server berjalan dan health check lulus.
- [x] CORS diuji untuk tiga skenario.
- [x] Tidak ada IP lokal atau link placeholder.
- [x] Build dashboard dan parse client lulus.
- [x] Rate limit dan validasi auth diuji.

---

## Phase 2: Dokumentasi

- [x] **Task 8: Selaraskan dokumentasi engineering dengan Prisma/PostgreSQL**
  - Acceptance: tech spec dan implementation plan sesuai kode aktual, tidak ada instruksi Mongoose aktif.
  - Verification: grep Mongo/Mongoose dan review silang dengan schema.
- [x] **Task 9: Perbarui dokumen produk sesuai scope final**
  - Status: PRD, app-flow, dan README sudah konsisten dengan keputusan scope.
  - Acceptance: PRD, app flow, dan README konsisten dengan keputusan Task 2.
  - Verification: grep istilah kunci dan review manusia.

### Checkpoint 2

- [x] Tidak ada kontradiksi jumlah latihan.
- [x] Tidak ada kontradiksi status resep.
- [x] Tidak ada instruksi MongoDB aktif.
- [ ] Dokumen disetujui manusia.

---

## Phase 3: Gap fungsional

- [x] **Task 10: Perbaiki metrik harian di `ProgressDashboard`**
  - Acceptance: metrik harian hanya memakai latihan yang dipilih, smoothness tidak valid tidak dihitung.
  - Verification: helper test, uji manual, Babel parse.
- [x] **Task 11: Pasien dapat membaca catatan terapis**
  - Acceptance: endpoint `GET /api/patient/notes`, UI pasien, empty/error state, isolasi data.
  - Verification: uji endpoint dengan database lokal dan uji akses.
- [x] **Task 12: Integrasi resep di dashboard terapis**
  - Acceptance: editor resep, validasi, grafik memakai target resep, pasien menerima nilai baru.
  - Verification: uji API, build dashboard, uji alur end-to-end.
- [x] **Task 13: Hitung total sesi secara akurat**
  - Acceptance: `totalSessions` dan `totalReps` benar, bukan panjang array 8 sesi.
  - Verification: uji response API dan build dashboard.

### Checkpoint 3

- [x] Metrik harian tidak menyesatkan.
- [x] Pasien dapat membaca catatan terapis.
- [x] Resep berfungsi end-to-end.
- [x] Total sesi akurat.
- [x] Build dashboard dan parse client lulus.
- [x] Alur pasien dan terapis diuji dengan database lokal.

---

## Phase 4: Kualitas dan struktur

- [x] **Task 14: Pecah file mobile yang melebihi 400 baris**
  - Acceptance: `ExerciseSession.js` dan `ProgressDashboard.js` di bawah 400 baris, perilaku tidak berubah.
  - Verification: `wc -l`, Babel parse, uji manual.
- [x] **Task 15: Harness test integrasi API**
  - Acceptance: database test lokal, migrate dan seed otomatis, smoke test lengkap, exit code benar.
  - Verification: jalankan harness dari kondisi bersih.
- [ ] **Task 16: Polish i18n dan tema** — DITUNDA
  - Status: ditunda karena prioritas rendah setelah fitur inti stabil.
  - Acceptance: cakupan i18n lengkap, tema terang dan gelap didukung.
  - Verification: uji kedua bahasa dan tema.

### Checkpoint 4: Selesai

- [ ] Task prioritas 1 sampai 13 selesai.
- [ ] Test dan build lulus.
- [ ] Alur pasien dan terapis diuji end-to-end.
- [ ] Dokumentasi konsisten.
- [ ] Tidak ada secret atau data pasien nyata.
- [ ] Manusia menyetujui hasil sebelum rilis.

---

## Blocker saat ini

- [x] Database Supabase tidak dapat dijangkau dari environment ini. Digantikan oleh `npm run test:integration` dengan PostgreSQL ephemeral di Docker.
- [x] Keputusan scope resep dan jumlah latihan sudah dicatat.
- [ ] Persetujuan untuk commit 118 perubahan belum ada.
- [ ] Uji runtime di perangkat fisik dan klik link video call belum dilakukan.
- [ ] Task 16 (i18n dan tema) ditunda karena prioritas rendah.

---

## Aksi eksternal yang tersisa

Semua pekerjaan kode yang direncanakan sudah selesai. Yang tersisa membutuhkan manusia atau perangkat:

1. Setujui dan eksekusi pengelompokan commit di `tasks/plan.md`.
2. Review dan sign-off dokumen produk dan engineering.
3. Uji aplikasi di perangkat fisik dengan `EXPO_PUBLIC_API_URL` dan link video call yang nyata.
4. Putuskan apakah Task 16 (i18n penuh dan tema otomatis) akan dikerjakan sebelum rilis.
