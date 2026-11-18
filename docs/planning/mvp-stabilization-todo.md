# Todo: Stabilisasi dan Penyelesaian RehabTrack MVP

**Plan lengkap:** `docs/planning/mvp-stabilization-plan.md`
**Status:** Menunggu persetujuan manusia. Jangan mulai implementasi sebelum plan disetujui.
**Mulai dari:** Task 1 (verifikasi baseline) dan Task 2 (keputusan scope).

## Aturan eksekusi

- [ ] Plan ini disetujui manusia.
- [ ] Tidak ada commit, push, atau rewrite history tanpa persetujuan.
- [ ] Setiap task harus lulus acceptance criteria dan verification di `docs/planning/mvp-stabilization-plan.md`.
- [ ] Update checklist ini setelah setiap task selesai.

---

## Phase 0: Baseline dan keputusan scope

- [x] **Task 1: Verifikasi dan kelompokkan baseline migrasi Prisma**
  - Status: 10 commit berurutan dibuat dan worktree bersih. Push ke `origin` belum.
  - Acceptance: semua parse, test, Prisma validate, build dashboard, dan health check lulus.
  - Verification: jalankan seluruh perintah baseline dan tinjau `git diff`.
- [x] **Task 2: Putuskan scope resep dan jumlah latihan**
  - Keputusan 2026-11-14: 6 latihan dan resep dipertahankan. Menunggu konfirmasi manusia.
  - Acceptance: keputusan tertulis dan disetujui manusia.
  - Verification: tidak ada kontradiksi di PRD, app flow, tech spec, dan README.

### Checkpoint 0

- [x] Task 1 dan Task 2 selesai.
- [x] Semua pemeriksaan baseline lulus.
- [ ] Keputusan scope disetujui manusia.
- [x] Rencana commit disetujui dan dieksekusi.

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

- [x] Task prioritas 1 sampai 13 selesai.
- [x] Test dan build lulus.
- [x] API end-to-end diuji dengan PostgreSQL lokal.
- [x] Dokumentasi konsisten.
- [x] Tidak ada secret atau data pasien nyata.
- [ ] Uji perangkat fisik.
- [ ] Sign-off manusia sebelum rilis.

---

## Phase 5: Release readiness (post-commit)

- [ ] **Task 17: CI workflow** (in progress)
  - Acceptance: GitHub Actions menjalankan integration test server dan build dashboard.
  - Verification: YAML parse dan workflow lulus setelah push.
- [ ] **Task 18: Browser regression test editor resep**
  - Acceptance: login terapis, pilih pasien, simpan resep, verifikasi pesan sukses dan nilai API.
  - Verification: jalankan test browser terhadap stack lokal.
- [ ] **Task 19: Staging deployment runbook**
  - Acceptance: backend, PostgreSQL, dashboard, env, migrate, seed, dan smoke test terdokumentasi serta dijalankan.
  - Verification: deploy staging dan jalankan smoke test.
- [ ] **Task 20: Physical device smoke test**
  - Acceptance: 6 latihan, kalibrasi, audio, sync offline, catatan, dan link video call diuji.
  - Verification: checklist Android dan iOS.
- [ ] **Task 21: Clinical validation target ROM**
  - Acceptance: terapis menyetujui atau menyesuaikan target 6 latihan.
  - Verification: catatan validasi klinis dan re-run integration test.
- [ ] **Task 16: i18n dan tema** — DITUNDA
  - Status: backlog setelah release readiness.

---

## Status commit

- [x] 10 commit berurutan dibuat.
- [x] Worktree bersih setelah commit.
- [x] CI workflow dan pembaruan plan/README sudah di-commit.
- [ ] Push ke `origin/main`.
- [ ] Sign-off manusia.
- [ ] Uji perangkat fisik.

## Aksi eksternal yang tersisa

1. Push commit ke `origin/main`.
2. Deploy staging dan jalankan smoke test.
3. Uji perangkat fisik Android dan iOS.
4. Validasi klinis target ROM.
5. Review dan sign-off dokumen produk serta engineering.
