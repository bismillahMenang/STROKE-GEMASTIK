# Implementation Plan: Stabilisasi dan Penyelesaian RehabTrack MVP

## Overview

Repo saat ini berada di tengah migrasi besar dari MongoDB/Mongoose ke PostgreSQL/Prisma, dengan 107 file berubah belum di-commit dan beberapa perbaikan runtime sudah diterapkan. Rencana ini memprioritaskan penguncian baseline yang bisa diverifikasi, keputusan scope yang masih ambigu, lalu penutupan gap deploy dan gap fungsional. Fitur baru tidak dimulai sebelum baseline dan keputusan scope selesai.

Urutan yang direkomendasikan:

1. Kunci baseline migrasi Prisma dan pastikan semua pemeriksaan lulus.
2. Putuskan apakah fitur resep dan 6 latihan dipertahankan atau dikembalikan ke scope PRD.
3. Perbaiki konfigurasi deploy dan keamanan dasar.
4. Selaraskan dokumentasi dengan arsitektur aktual.
5. Tutup gap fungsional yang terlihat oleh pengguna.
6. Rapikan struktur file dan tambah test integrasi.

## Architecture Decisions

- PostgreSQL + Prisma adalah source of truth. Dokumentasi dan script harus mengikuti arsitektur ini.
- API mengembalikan primary key dengan nama `id`, bukan `_id`. Sisa `_id` sudah dibersihkan.
- Fitur resep dan jumlah latihan mengikuti keputusan scope pada Task 2. Jika tidak dipertahankan, hapus dari server, client, dashboard, schema, dan migrasi.
- Konfigurasi lingkungan wajib untuk `CORS_ORIGIN`, `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_THERAPIST_CALL_URL`, dan `VITE_THERAPIST_CALL_URL`. Tidak boleh ada IP lokal atau link placeholder di source.
- Tidak ada commit, push, atau rewrite history tanpa persetujuan manusia.
- Verifikasi database penuh membutuhkan PostgreSQL yang bisa dijangkau. Supabase pooler saat ini tidak dapat diakses dari environment pengembangan.

## Task List

### Phase 0: Baseline dan keputusan scope

#### Task 1: Verifikasi dan kelompokkan baseline migrasi Prisma

**Description:** Pastikan working tree yang berisi 107 perubahan tidak memiliki regresi sintaks atau build, lalu susun pengelompokan commit logis. Commit hanya dilakukan setelah disetujui.

**Acceptance criteria:**
- [ ] Seluruh source client dan dashboard lolos Babel parse.
- [ ] Seluruh file server lolos `node --check`.
- [ ] `node --test data/rom.test.js` lulus 9/9.
- [ ] `node client/scripts/metrics-check.js` lulus.
- [ ] `npx prisma validate` lulus.
- [ ] `npm run build` di `therapist-dashboard` lulus.
- [ ] `GET /api/health` mengembalikan status OK.
- [ ] Daftar commit yang diusulkan disetujui manusia.

**Verification:**
- [ ] Jalankan seluruh perintah di atas dan simpan ringkasan hasil.
- [ ] Tinjau `git diff --stat` dan `git status --short`.
- [ ] Pastikan tidak ada file `.env`, `node_modules`, atau artefak build yang ikut tracked.

**Dependencies:** None.

**Files likely touched:** Tidak ada perubahan source yang diharapkan. Mungkin `.gitignore` jika ada artefak yang belum diabaikan.

**Estimated scope:** Small.

**Proposed commit grouping (belum dieksekusi, menunggu persetujuan):**

1. `chore: ignore local dev logs and reference repositories`
   - `.gitignore`
   - Mencegah `server/.dev.*`, `therapist-dashboard/.dev.*`, dan `data/reference/Pulihgo` masuk repo.
2. `refactor(server): migrate data layer to Prisma and PostgreSQL`
   - `server/prisma/schema.prisma`, `server/prisma/migrations/`, `server/lib/prisma.js`, `server/server.js`, `server/routes/*`, `server/seed.js`, `server/scripts/*`, `server/package.json`, `server/package-lock.json`
   - Hapus `server/routes/assessments.js`.
   - Gunakan interactive staging jika ada perubahan fitur yang tercampur.
3. `feat(server): add pain, prescription, review, and session totals`
   - `server/routes/sessions.js`, `server/routes/patient.js`, `server/routes/therapist.js`
   - Migrasi `add_pain_and_prescription`.
4. `feat(server): validate auth input and rate limit credentials`
   - `server/routes/auth.js`, `server/utils/validation.js`, `server/middleware/rateLimit.js`, `server/scripts/validation.test.js`, `server/.env.example`, `server/package.json`.
5. `feat(client): add onboarding, theme, sound cues, prescriptions, and offline sync`
   - `client/App.js`, `client/screens/`, `client/components/`, `client/theme/`, `client/utils/`, `client/api/`, `client/assets/sounds/`, `client/package.json`, `client/app.json`, `client/babel.config.js`, `client/.env.example`.
6. `feat(dashboard): refresh therapist workflows and Prisma ids`
   - `therapist-dashboard/src/`, `therapist-dashboard/index.html`, `therapist-dashboard/public/`, `therapist-dashboard/.env.example`.
7. `test(data): add ROM fixtures and metric checks`
   - `data/test/fixtures/`, `data/rom.test.js`, `data/generate_rom_fixtures.js`, `client/scripts/metrics-check.js`, `client/scripts/generate-sounds.js`.
8. `docs: restructure planning, product, engineering, and manuals`
   - `docs/`, `data/docs/`, `README.md`, `AGENTS.md`, penghapusan dokumen root lama.
9. `chore: add implementation plan and task checklist`
   - `tasks/plan.md`, `tasks/todo.md`.

Catatan: `data/reference/` dan file `.dev.*` tidak boleh di-commit. Commit hanya dilakukan setelah manusia menyetujui pengelompokan ini.

---

#### Task 2: Putuskan scope resep dan jumlah latihan

**Description:** PRD menyebut 3 latihan dan "prescription or medication management" sebagai non-goal, tetapi kode sudah memiliki 6 latihan dan fitur resep. Ambil keputusan eksplisit sebelum menulis kode lanjutan.

**Pilihan:**
- A. Pertahankan resep dan 6 latihan, lalu perbarui PRD, app flow, tech spec, dan selesaikan UI dashboard.
- B. Kembalikan ke 3 latihan dan hapus fitur resep dari server, client, dashboard, schema, dan migrasi.
- C. Pertahankan 6 latihan tetapi hapus resep, atau sebaliknya. Keputusan harus dicatat.

**Keputusan (2026-11-14):** Opsi A. Enam latihan dan fitur resep latihan dipertahankan. Alasannya: keduanya sudah terimplementasi, resep yang dikontrol terapis lebih aman daripada target hardcoded, dan target tambahan tetap ditandai provisional untuk validasi klinis. Keputusan ini dapat dibalik jika tim memilih kembali ke 3 latihan.

**Acceptance criteria:**
- [ ] Keputusan tertulis di `docs/product/prd.md` atau dokumen keputusan terpisah.
- [ ] Daftar latihan final tercatat.
- [ ] Status fitur resep tercatat sebagai dipertahankan atau dihapus.
- [ ] Dampak ke Task 12 dan Task 9 tercatat.

**Verification:**
- [ ] Baca ulang PRD, app flow, tech spec, dan README. Tidak ada kontradiksi tentang jumlah latihan atau resep.
- [ ] Konfirmasi keputusan dengan manusia sebelum implementasi.

**Dependencies:** None. Membutuhkan keputusan manusia.

**Files likely touched:** `docs/product/prd.md`, `docs/engineering/app-flow.md`, `docs/engineering/tech-spec.md`.

**Estimated scope:** Small.

---

### Checkpoint 0: Baseline dan scope

- [ ] Task 1 dan Task 2 selesai.
- [ ] Semua pemeriksaan baseline lulus.
- [ ] Keputusan scope disetujui manusia.
- [ ] Rencana commit disetujui sebelum commit pertama.

---

### Phase 1: Konfigurasi deploy dan keamanan dasar

#### Task 3: Hormati `CORS_ORIGIN` di server

**Description:** `server.js` masih memakai `app.use(cors())` yang mengizinkan semua origin, sementara `CORS_ORIGIN` sudah ada di `.env.example` tetapi tidak dipakai. Ganti dengan allowlist yang tetap mengizinkan request tanpa Origin untuk aplikasi mobile.

**Acceptance criteria:**
- [ ] Origin yang ada di `CORS_ORIGIN` mendapat header `Access-Control-Allow-Origin`.
- [ ] Origin yang tidak terdaftar tidak mendapat header tersebut.
- [ ] Request tanpa Origin tetap berhasil untuk mobile dan curl.
- [ ] `GET /api/health` tetap berhasil.

**Verification:**
- [ ] Jalankan server, lalu uji dengan `curl -i -H "Origin: http://localhost:5173"`.
- [ ] Uji origin yang tidak terdaftar.
- [ ] Uji request tanpa header Origin.

**Dependencies:** Task 1.

**Files likely touched:** `server/server.js`, `server/.env.example`, `README.md`.

**Estimated scope:** Small.

---

#### Task 4: Konfigurasi API URL mobile lewat environment

**Description:** `client/utils/constants.js` masih memakai IP lokal `192.168.1.16` dan URL produksi placeholder. Pindahkan ke `process.env.EXPO_PUBLIC_API_URL` dengan fallback yang terdokumentasi.

**Acceptance criteria:**
- [ ] `API_URL` dibaca dari `EXPO_PUBLIC_API_URL`.
- [ ] Tidak ada IP lokal atau URL placeholder di source yang tracked.
- [ ] `client/.env.example` menjelaskan variabel yang dibutuhkan.
- [ ] README menjelaskan cara mengatur untuk perangkat fisik dan produksi.

**Verification:**
- [ ] `grep -rn "192.168" client --exclude-dir=node_modules` tidak menemukan hasil.
- [ ] Babel parse `client/utils/constants.js`.
- [ ] Jalankan aplikasi dengan env yang diisi dan pastikan request menuju URL tersebut.

**Dependencies:** Task 1.

**Files likely touched:** `client/utils/constants.js`, `client/.env.example`, `README.md`.

**Estimated scope:** Small.

---

#### Task 5: Konfigurasi link video call

**Description:** Link Google Meet masih placeholder di client dan dashboard. Pindahkan ke environment untuk masing-masing aplikasi.

**Acceptance criteria:**
- [ ] Client membaca `EXPO_PUBLIC_THERAPIST_CALL_URL`.
- [ ] Dashboard membaca `VITE_THERAPIST_CALL_URL`.
- [ ] Tidak ada link `meet.google.com/your-rehabtrack-room` di source.
- [ ] Fallback dan cara konfigurasi terdokumentasi.

**Verification:**
- [ ] `grep -rn "your-rehabtrack-room" client therapist-dashboard --exclude-dir=node_modules`.
- [ ] Babel parse client dan build dashboard.

**Dependencies:** Task 1.

**Files likely touched:** `client/utils/constants.js`, `client/.env.example`, `therapist-dashboard/src/pages/PatientDetail.jsx`, `therapist-dashboard/.env.example`, `README.md`.

**Estimated scope:** Small.

---

#### Task 6: Normalisasi email dan kebijakan password

**Description:** Register dan login belum menormalkan email dan belum menetapkan panjang minimum password. Tambahkan normalisasi dan validasi di satu helper agar konsisten.

**Acceptance criteria:**
- [ ] Email di-trim dan di-lowercase sebelum query dan penyimpanan.
- [ ] Register menolak password kurang dari 8 karakter dengan pesan 400 yang jelas.
- [ ] Login tetap menerima email dengan huruf besar atau spasi di tepi.
- [ ] Password tidak pernah muncul di response atau log.

**Verification:**
- [ ] Tambahkan test unit untuk helper validasi.
- [ ] Uji route dengan database lokal jika tersedia.
- [ ] Periksa log server tidak memuat password.

**Dependencies:** Task 1. Verifikasi route membutuhkan database.

**Files likely touched:** `server/routes/auth.js`, `server/utils/validation.js` (baru), `server/scripts/verifyAuth.js` (baru), `server/package.json`.

**Estimated scope:** Small.

---

#### Task 7: Rate limit endpoint autentikasi

**Description:** Endpoint login dan register belum memiliki pembatasan percobaan. Tambahkan `express-rate-limit` dengan konfigurasi yang bisa diatur lewat environment.

**Acceptance criteria:**
- [ ] Login dan register dibatasi per IP, misalnya 10 percobaan per 15 menit.
- [ ] Request melebihi batas mendapat 429 dengan pesan yang jelas.
- [ ] Limit bisa diatur lewat environment.
- [ ] Dependency baru tercatat di tech spec.

**Verification:**
- [ ] Uji dengan beberapa request berurutan.
- [ ] Pastikan request normal di bawah batas tetap berhasil.
- [ ] Jalankan `node --check` dan test server.

**Dependencies:** Task 1, Task 6.

**Files likely touched:** `server/package.json`, `server/routes/auth.js` atau `server/server.js`, `server/.env.example`, `docs/engineering/tech-spec.md`.

**Estimated scope:** Small.

---

### Checkpoint 1: Konfigurasi dan keamanan

- [ ] Server berjalan dan health check lulus.
- [ ] CORS diuji untuk origin diizinkan, ditolak, dan tanpa Origin.
- [ ] Client dan dashboard tidak lagi memuat IP lokal atau link placeholder.
- [ ] Build dashboard dan parse client lulus.
- [ ] Rate limit dan validasi auth diuji.

---

### Phase 2: Dokumentasi

#### Task 8: Selaraskan dokumentasi engineering dengan Prisma/PostgreSQL

**Description:** `docs/engineering/tech-spec.md` dan `implementation_plan.md` masih menyebut MongoDB, Mongoose, dan struktur `server/models`. Perbarui agar sesuai dengan Prisma, PostgreSQL, struktur route saat ini, dan perintah setup di README.

**Acceptance criteria:**
- [ ] Tech spec menjelaskan PostgreSQL, Prisma, dan `server/prisma/schema.prisma`.
- [ ] Struktur folder dan daftar dependency sesuai kode aktual.
- [ ] Perintah setup, migrate, seed, dan test sesuai README.
- [ ] Tidak ada instruksi Mongoose yang masih aktif.
- [ ] Referensi ke `server/models` dihapus atau ditandai historis.

**Verification:**
- [ ] `grep -ri "mongo\|mongoose" docs/engineering README.md` hanya menemukan catatan historis jika ada.
- [ ] Ikuti perintah setup dari dokumen di environment bersih.
- [ ] Review silang dengan `server/prisma/schema.prisma` dan `server/routes`.

**Dependencies:** Task 2, karena keputusan scope memengaruhi isi dokumen.

**Files likely touched:** `docs/engineering/tech-spec.md`, `docs/engineering/implementation_plan.md`, `docs/engineering/rules.md`, `README.md`.

**Estimated scope:** Medium.

---

#### Task 9: Perbarui dokumen produk sesuai scope final

**Description:** Setelah Task 2, selaraskan PRD, app flow, dan README dengan jumlah latihan, status resep, dan visibilitas catatan terapis.

**Acceptance criteria:**
- [ ] PRD dan app flow menyebut jumlah latihan yang sama dengan kode.
- [ ] Status resep konsisten di semua dokumen.
- [ ] Klaim "catatan terapis terlihat oleh pasien" hanya ada jika Task 11 dikerjakan.
- [ ] README tidak memuat fitur yang belum ada.

**Verification:**
- [ ] `grep -rn "3 exercises\|3 latihan\|prescription\|resep" docs README.md`.
- [ ] Review manual bersama manusia.

**Dependencies:** Task 2, Task 8.

**Files likely touched:** `docs/product/prd.md`, `docs/engineering/app-flow.md`, `README.md`.

**Estimated scope:** Small.

---

### Checkpoint 2: Dokumentasi konsisten

- [ ] Tidak ada kontradiksi jumlah latihan.
- [ ] Tidak ada kontradiksi status resep.
- [ ] Tidak ada instruksi MongoDB yang masih aktif.
- [ ] Dokumen disetujui manusia.

---

### Phase 3: Gap fungsional

#### Task 10: Perbaiki metrik harian di `ProgressDashboard`

**Description:** `daySessions` mencampur semua jenis latihan, lalu `romPercent` membagi ROM terbaik dengan target latihan yang sedang dipilih. Filter metrik harian berdasarkan `exerciseKey` atau ubah label agar tidak menyesatkan. Keluarkan nilai `avgSmoothness` yang tidak valid dari rata-rata.

**Acceptance criteria:**
- [ ] Ring ROM, coach insight, dan effort hanya memakai sesi dari latihan yang dipilih.
- [ ] Perubahan pilihan latihan mengubah metrik harian secara konsisten.
- [ ] Sesi tanpa `avgSmoothness` tidak menurunkan rata-rata secara palsu.
- [ ] Empty state tetap benar.

**Verification:**
- [ ] Tambahkan helper murni dan test di `client/scripts/metrics-check.js`.
- [ ] Uji manual dengan data lokal beberapa latihan.
- [ ] Babel parse `ProgressDashboard.js`.

**Dependencies:** Task 1.

**Files likely touched:** `client/screens/ProgressDashboard.js`, `client/utils/streak.js` atau util baru, `client/scripts/metrics-check.js`.

**Estimated scope:** Small.

---

#### Task 11: Pasien dapat membaca catatan terapis

**Description:** Dashboard menyatakan catatan mingguan terlihat oleh pasien, tetapi server belum punya endpoint pasien untuk catatan. Tambahkan endpoint dan tampilan di aplikasi pasien.

**Acceptance criteria:**
- [ ] `GET /api/patient/notes` mengembalikan catatan milik pasien, terbaru lebih dulu, dengan batas jumlah.
- [ ] Endpoint memerlukan JWT pasien dan tidak membocorkan catatan pasien lain.
- [ ] Aplikasi pasien menampilkan minggu, tanggal, dan isi catatan.
- [ ] Ada empty state dan error state.
- [ ] Catatan baru dari terapis muncul setelah refresh.

**Verification:**
- [ ] Uji endpoint dengan database lokal.
- [ ] Uji akses tanpa token dan dengan token pasien lain.
- [ ] Babel parse client dan build dashboard.

**Dependencies:** Task 1, Task 2, Task 9. Verifikasi membutuhkan database.

**Files likely touched:** `server/routes/patient.js`, `client/api/client.js`, `client/screens/ProgressDashboard.js` atau screen baru, `client/App.js`.

**Estimated scope:** Medium.

---

#### Task 12: Integrasi resep di dashboard terapis

**Conditional:** Hanya dikerjakan jika Task 2 memilih opsi mempertahankan resep.

**Description:** API `PUT /therapist/patients/:id/prescription` sudah ada, tetapi dashboard belum punya UI dan grafik masih memakai target hardcoded. Tambahkan editor resep dan gunakan data `prescriptions` dari detail pasien.

**Acceptance criteria:**
- [ ] Terapis dapat mengatur `targetRom`, `romCeiling`, dan `targetReps` per latihan.
- [ ] Validasi `romCeiling >= targetRom` dan nilai positif.
- [ ] Grafik menampilkan garis target dari resep, bukan konstanta `TARGETS`.
- [ ] Pasien menerima nilai baru melalui `/api/patient/prescription`.
- [ ] Ada feedback sukses dan gagal.

**Verification:**
- [ ] Uji API dengan database lokal.
- [ ] Build dashboard.
- [ ] Babel parse client.
- [ ] Uji alur terapis mengubah resep lalu pasien membuka sesi.

**Dependencies:** Task 2, Task 8, Task 9.

**Files likely touched:** `therapist-dashboard/src/api/therapistAPI.js`, `therapist-dashboard/src/components/PrescriptionEditor.jsx` (baru), `therapist-dashboard/src/pages/PatientDetail.jsx`, `therapist-dashboard/src/components/ROMTrendChart.jsx`.

**Estimated scope:** Medium.

---

#### Task 13: Hitung total sesi secara akurat

**Description:** Endpoint detail pasien hanya mengembalikan 8 sesi terakhir, tetapi UI menampilkan label "Total Sesi". Tambahkan jumlah total dan total repetisi ke response, atau ubah label agar sesuai.

**Acceptance criteria:**
- [ ] Response detail memuat `totalSessions` dan `totalReps`.
- [ ] Dashboard menampilkan angka total yang benar, bukan panjang array 8 sesi.
- [ ] Tidak ada query per sesi tambahan.

**Verification:**
- [ ] Uji response API.
- [ ] Build dashboard.
- [ ] Bandingkan dengan `prisma.session.count` dan agregasi repetisi.

**Dependencies:** Task 1.

**Files likely touched:** `server/routes/therapist.js`, `therapist-dashboard/src/pages/PatientDetail.jsx`.

**Estimated scope:** Small.

---

### Checkpoint 3: Gap fungsional utama

- [ ] Metrik harian tidak menyesatkan.
- [ ] Pasien dapat membaca catatan terapis.
- [ ] Resep berfungsi end-to-end jika dipertahankan.
- [ ] Total sesi akurat.
- [ ] Build dashboard dan parse client lulus.
- [ ] Uji alur pasien dan terapis dengan database lokal.

---

### Phase 4: Kualitas dan struktur

#### Task 14: Pecah file mobile yang melebihi 400 baris

**Description:** `client/screens/ExerciseSession.js` sekitar 514 baris dan `ProgressDashboard.js` sekitar 529 baris, melanggar hard limit di `rules.md`. Ekstrak style, subkomponen, dan hook tanpa mengubah perilaku.

**Acceptance criteria:**
- [ ] Kedua file di bawah 400 baris.
- [ ] Perilaku sesi, ringkasan, dan progres tidak berubah.
- [ ] Tidak ada duplikasi style atau logika baru.
- [ ] Parse, metrics-check, dan build tetap lulus.

**Verification:**
- [ ] `wc -l` untuk kedua file.
- [ ] Babel parse seluruh client.
- [ ] Uji manual alur latihan dan progres.

**Dependencies:** Task 10, Task 11, Task 12. Refactor dilakukan setelah perubahan fungsional agar tidak menimbulkan konflik.

**Files likely touched:** `client/screens/ExerciseSession.js`, `client/screens/ProgressDashboard.js`, komponen atau hook baru.

**Estimated scope:** Medium, dipecah per file jika perlu.

---

#### Task 15: Harness test integrasi API

**Description:** Verifikasi API saat ini bergantung pada database eksternal yang tidak selalu bisa dijangkau. Sediakan database test lokal dan satukan migrate, seed, smoke test dalam satu perintah.

**Acceptance criteria:**
- [ ] Ada cara menjalankan PostgreSQL test secara lokal, misalnya Docker Compose.
- [ ] Migrasi dan seed berjalan otomatis.
- [ ] Smoke test menutup semua endpoint utama.
- [ ] Perintah keluar dengan kode non-zero saat gagal.
- [ ] Dokumentasi cara menjalankan test ditambahkan.

**Verification:**
- [ ] Jalankan harness dari kondisi bersih.
- [ ] Pastikan test gagal jika endpoint rusak.
- [ ] Pastikan tidak menyentuh database produksi.

**Dependencies:** Task 1, Task 3, Task 6, Task 7. Sebaiknya setelah gap fungsional selesai.

**Files likely touched:** `docker-compose.test.yml` (baru), `server/scripts/smokeApi.js`, `server/package.json`, `README.md`.

**Estimated scope:** Large. Pecah menjadi setup database, seed fixture, dan CI script jika dikerjakan.

---

#### Task 16: Polish i18n dan tema

**Description:** Cakupan i18n baru sebagian dan `app.json` masih memaksa tema terang meskipun ada tema gelap. Rapikan setelah fitur inti stabil.

**Acceptance criteria:**
- [ ] Semua teks pasien dan terapis memakai i18n atau string terpusat.
- [ ] `userInterfaceStyle` mendukung tema terang dan gelap.
- [ ] Tidak ada teks campuran bahasa yang tidak disengaja.
- [ ] Tampilan tetap terbaca di kedua tema.

**Verification:**
- [ ] Uji kedua bahasa.
- [ ] Uji kedua tema di perangkat atau emulator.
- [ ] Babel parse dan build dashboard.

**Dependencies:** Task 14.

**Files likely touched:** `client/i18n.js`, `client/app.json`, `client/theme/ThemeContext.js`, `therapist-dashboard/src/i18n.js`.

**Estimated scope:** Small.

---

### Checkpoint 4: Selesai

- [ ] Semua task prioritas 1 sampai 13 selesai.
- [ ] Test dan build lulus.
- [ ] Alur pasien dan terapis diuji end-to-end.
- [ ] Dokumentasi konsisten.
- [ ] Tidak ada secret atau data pasien nyata di repo.
- [ ] Manusia menyetujui hasil sebelum rilis.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| 107 file belum di-commit dan bercampur | High | Task 1 memverifikasi dan mengelompokkan commit sebelum pekerjaan baru. Commit hanya setelah persetujuan. |
| Scope resep dan 6 latihan belum diputuskan | High | Task 2 menjadi gate. Jangan implementasi Task 12 sebelum keputusan. |
| Database Supabase tidak dapat dijangkau dari environment ini | High | Gunakan PostgreSQL lokal atau Docker untuk test. Jangan mengandalkan Supabase untuk verifikasi otomatis. |
| Menambah dependency rate limit | Medium | Catat di tech spec dan minta persetujuan. |
| Perubahan env Expo tidak terbaca | Medium | Uji dengan restart Metro dan dokumentasikan variabel `EXPO_PUBLIC_*`. |
| Refactor file besar menimbulkan regresi | Medium | Lakukan setelah fitur stabil, dengan parse, metrics-check, dan uji manual. |
| Perubahan CORS memblokir dashboard | Medium | Uji tiga skenario: origin diizinkan, ditolak, dan tanpa Origin. |

## Open Questions

1. Apakah fitur resep dipertahankan? PRD menyebut non-goal, tetapi server dan client sudah memiliki implementasi.
2. Apakah 6 latihan final atau kembali ke 3 latihan sesuai PRD?
3. Apakah catatan terapis wajib terlihat oleh pasien? Dashboard menyatakan ya, tetapi endpoint pasien belum ada.
4. Apakah audio cue per rep wajib untuk MVP? PRD menyebutnya, implementasi saat ini hanya memiliki suara target dan ceiling.
5. Apakah 107 perubahan boleh di-commit sekarang, dan bagaimana pengelompokan commit yang diinginkan?
6. Apakah tersedia database PostgreSQL lokal atau kredensial Supabase yang aktif untuk verifikasi end-to-end?
7. Apakah penambahan dependency `express-rate-limit` disetujui?
