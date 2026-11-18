# RehabTrack (STROKE-GEMASTIK)

**Sistem Monitoring Rehabilitasi Pasca-Stroke Berbasis Smartphone dengan Pelacakan Range-of-Motion Menggunakan Gyroscope dan Tele-Supervision Asinkron**

RehabTrack adalah aplikasi rehabilitasi pasca-stroke untuk pasien dan terapis. Pasien menjalankan latihan Range of Motion (ROM) dengan panduan aplikasi mobile yang membaca data giroskop ponsel, melihat progres latihan, dan menerima catatan mingguan dari terapis. Terapis memantau kemajuan pasien melalui dashboard web, meninjau sesi, menetapkan target ROM dan batas aman per latihan, serta menjadwalkan sesi tele-supervision asinkron melalui tautan video call eksternal.

Repositori ini adalah monorepo yang berisi aplikasi pasien, REST API, dashboard terapis, dokumentasi produk dan engineering, serta rencana kerja Phase 2.

**Lingkup saat ini:** implementasi yang berjalan dibatasi pada Phase 1 (MVP), yaitu pelacakan ROM berbasis giroskop dan tele-supervision asinkron. Fitur Phase 2 (kamera asimetri wajah, audio disartria, prediksi risiko) masih berupa rencana dan belum dieksekusi. Migrasi klien mobile dari Expo ke Flutter juga baru berupa rencana.

## 1. Status Cepat

| Area | Status | Lokasi |
|------|--------|--------|
| Klien mobile aktif | Berjalan, dipakai sampai cutover | `client/` |
| Klien mobile target | Direncanakan, belum ada kode | `mobile/` |
| Phase 1 (MVP) | Berjalan, sisa uji perangkat dan validasi klinis | `docs/planning/mvp-stabilization-plan.md` |
| Phase 2 (multimodal) | Direncanakan, draf rencana belum dieksekusi | `docs/planning/phase2-execution-plan.md` |
| Migrasi Flutter | Direncanakan, parity-first | `mobile/README.md` |
| Backend API | Berjalan | `server/` |
| Dashboard terapis | Berjalan | `therapist-dashboard/` |

`client/` adalah klien legacy yang masih menjadi aplikasi produksi. `mobile/` adalah target Flutter jangka panjang dan belum berisi kode aplikasi. Keduanya tidak boleh dipertukarkan sebelum proses cutover resmi.

## 2. Tech Stack

| Layer | Teknologi | Status |
|-------|-----------|--------|
| Mobile saat ini | React Native 0.86 + Expo SDK 57, React 19.2 | Aktif di `client/` |
| Mobile target | Flutter (Dart) | Direncanakan, belum ada kode |
| Dashboard terapis | React + Vite 5, react-router-dom v6 | Aktif |
| Backend | Node.js 18+ + Express 4 | Aktif |
| ORM | Prisma 6 | Aktif |
| Database | PostgreSQL 16 (Supabase atau Docker lokal) | Aktif |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs`, rate limit login | Aktif |
| Charts | `react-native-chart-kit` + `react-native-svg` (mobile), `recharts` v3 (web) | Aktif |
| Sensor | `expo-sensors` (Gyroscope) | Aktif |
| Penyimpanan lokal | `@react-native-async-storage/async-storage` | Aktif |
| Video call | Tautan Google Meet atau Zoom eksternal | Aktif, tanpa infrastruktur video internal |

Keputusan stack untuk MVP dicatat di `docs/engineering/tech-spec.md` bagian 2. Rencana Flutter belum mengubah keputusan backend, dashboard, atau model data.

## 3. Struktur Folder

```
STROKE-GEMASTIK/
├── client/                     # Klien mobile aktif (React Native + Expo)
│   ├── App.js                  # Entry point dan navigasi
│   ├── screens/                # Auth, Onboarding, ExerciseSelect, ExerciseSession,
│   │                           # ProgressDashboard, TherapistNotesScreen, GyroTestScreen
│   ├── components/             # GyroSensor, ROMChart, SessionCard, SessionSummary,
│   │                           # ExerciseCard, PrimaryButton
│   ├── api/client.js           # HTTP client dan sinkronisasi offline-safe
│   ├── utils/                  # gyroProcessing, progressMetrics, prescription, storage,
│   │                           # streak, soundManager, constants, mockAngle
│   ├── theme/                  # Theme context
│   ├── scripts/                # metrics-check.js, generate-sounds.js
│   ├── tests/                  # rom.test.js, generate_rom_fixtures.js, fixtures/
│   └── .env.example
├── mobile/                     # Placeholder Flutter, belum ada kode
│   └── README.md               # Ringkasan status dan aturan migrasi
├── server/                     # REST API Express + Prisma
│   ├── routes/                 # auth, patient, sessions, therapist
│   ├── middleware/             # authMiddleware.js, rateLimit.js
│   ├── prisma/                 # schema.prisma dan migrations/
│   ├── utils/validation.js     # Validasi input bersama
│   ├── scripts/                # smokeApi, verifyModels, verifySessions,
│   │                           # verifyTherapist, validation.test.js, test-integration.sh
│   └── seed.js                 # Data demo
├── therapist-dashboard/        # Dashboard terapis (Vite + React)
│   ├── src/pages/              # Login, PatientList, PatientDetail
│   ├── src/components/         # ROMTrendChart, SessionLog, WeeklyNoteEditor, PrescriptionEditor
│   ├── src/api/                # therapistAPI.js
│   └── vite.config.js
├── docs/
│   ├── setup/                  # AUDIO_SETUP, ROM_SETUP, SETUP_INSTRUCTIONS
│   ├── planning/               # Rencana stabilisasi MVP dan eksekusi Phase 2
│   │   ├── mvp-stabilization-plan.md
│   │   ├── mvp-stabilization-todo.md
│   │   ├── phase2-execution-plan.md
│   │   ├── phase2/             # 4 dokumen pendukung Phase 2
│   │   ├── archive/            # Week1_ExecutionPlan
│   │   └── parts/              # Ruang kerja draf, saat ini kosong
│   ├── product/                # prd, MVP_Spec_TechStack, Problem_Validation_Synthesis,
│   │                           # naming_and_scope_audit
│   ├── engineering/            # tech-spec, app-flow, design-brief, rules,
│   │                           # implementation_plan, roadmap-phase2-3
│   ├── manuals/                # PATIENT_MANUAL, THERAPIST_MANUAL
│   └── proposal/               # deskripsi-gemastik
├── references/                 # Repo referensi lokal, gitignored
├── .github/workflows/ci.yml    # CI server dan dashboard
├── AGENTS.md                   # Instruksi untuk AI coding agents
└── README.md
```

**Penjelasan folder utama:**

- `client/` berisi aplikasi Expo yang aktif. `client/tests/` memuat unit test ROM dan generator fixture sintetis. `client/scripts/` memuat pemeriksaan regresi metrik yang tidak butuh perangkat.
- `mobile/` disiapkan sebagai rumah aplikasi Flutter. Saat ini hanya berisi `README.md`, belum ada proyek Dart, `pubspec.yaml`, maupun kode layar.
- `server/` berisi API Express, skema Prisma, migrasi, seed demo, dan skrip verifikasi manual.
- `therapist-dashboard/` berisi dashboard React. Build produksi ditulis ke `dist/` dan tidak di-commit.
- `docs/setup/` memuat panduan penyiapan fixture audio dan ROM serta instruksi setup lanjutan. Generator Phase 2 yang belum dibuat ditandai sebagai rencana di dokumen terkait.
- `docs/planning/` memuat rencana stabilisasi MVP, checklist task, rencana eksekusi Phase 2, dokumen pendukung di `phase2/`, arsip, dan ruang kerja `parts/`.
- `docs/product/`, `docs/engineering/`, `docs/manuals/`, `docs/proposal/` memisahkan dokumen produk, spesifikasi teknis, manual pengguna, dan proposal kompetisi.
- `references/` menyimpan repository referensi lokal untuk riset. Folder ini di-gitignore dan bukan bagian dari produk.

## 4. Prasyarat dan Setup Backend

Prasyarat:

- Node.js 18 atau lebih baru.
- Akun Supabase (opsi cloud) atau PostgreSQL 16 lokal melalui Docker/Podman.
- `npx expo` untuk menjalankan klien mobile.
- Perangkat Android atau iOS fisik untuk pengujian mobile.

Backend memakai PostgreSQL melalui Prisma. Ada dua opsi database.

### Opsi A: Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka Project Settings lalu Database, salin connection string URI.
3. Tempel sebagai `DATABASE_URL` di `server/.env`.

Contoh `server/.env` (placeholder, jangan commit nilai asli):

```env
PORT=5000
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
JWT_SECRET=replace-with-strong-random-secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:19006
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
```

### Opsi B: PostgreSQL lokal dengan Docker

```bash
docker run -d --name stroke-postgres -p 5432:5432 \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=strokeapp \
  postgres:16
```

```env
DATABASE_URL=postgresql://admin:secret@localhost:5432/strokeapp
```

### Menjalankan backend

```bash
cd server
cp .env.example .env
# Isi DATABASE_URL, JWT_SECRET, dan CORS_ORIGIN
npm install
npx prisma migrate dev
npx prisma generate
npm run seed
npm test
node server.js
```

Server berjalan di `http://localhost:5000`. Pada PowerShell, gunakan `Copy-Item .env.example .env` sebagai pengganti `cp`. `npm test` menjalankan `scripts/verifyModels.js` dan memerlukan database yang dapat dijangkau.

Endpoint utama:

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register-patient` | Daftar pasien |
| POST | `/api/auth/login` | Login pasien |
| POST | `/api/auth/login-therapist` | Login terapis |
| GET | `/api/patient/me` | Profil pasien |
| GET | `/api/patient/notes` | Catatan mingguan terapis |
| GET | `/api/patient/prescription?exercise=` | Resep aktif per latihan |
| POST/GET | `/api/patient/sessions` | Simpan dan baca sesi pasien |
| GET | `/api/therapist/patients` | Daftar pasien terapis |
| GET | `/api/therapist/patients/:id` | Detail pasien |
| PATCH | `/api/therapist/patients/:id/notes` | Simpan catatan mingguan |
| PATCH | `/api/therapist/patients/:id/sessions/:sessionId/review` | Review sesi |
| PUT | `/api/therapist/patients/:id/prescription` | Simpan resep latihan |

## 5. Setup Therapist Dashboard

```bash
cd therapist-dashboard
npm install
# Buat .env.local
# VITE_API_URL=http://localhost:5000/api
# VITE_THERAPIST_CALL_URL=https://meet.google.com/abc-defg-hij
npm run dev
npm run build
```

Dashboard pengembangan berjalan di `http://localhost:5173`. `npm run build` menghasilkan bundel produksi di `dist/`.

Login memakai akun demo dari seed:

- Email: `terapis.demo@example.com`
- Password: `demo-password-123`

## 6. Setup Mobile Expo (Klien Saat Ini)

```bash
cd client
npm install
```

### Environment

Salin `client/.env.example` menjadi `client/.env`, lalu isi dua variabel:

```env
EXPO_PUBLIC_API_URL=http://[IP_LAN_KOMPUTER]:5000/api
EXPO_PUBLIC_THERAPIST_CALL_URL=https://meet.google.com/abc-defg-hij
```

Gunakan IP LAN komputer, bukan `localhost`, agar ponsel dapat menghubungi backend. `client/.env` di-gitignore dan tidak boleh di-commit.

### Menjalankan di perangkat fisik

1. Pastikan ponsel dan komputer berada di jaringan yang sama.
2. Jalankan backend sehingga dapat diakses dari jaringan tersebut.
3. Jalankan aplikasi:

```bash
npx expo start
```

4. Pindai QR code dengan Expo Go di Android atau kamera di iOS.

Beberapa modul native yang dipakai (misalnya `expo-audio` dan `expo-dev-client`) memerlukan development build, bukan Expo Go, untuk fitur tertentu. Jika build gagal karena modul native, jalankan `npx expo run:android` atau `npx expo run:ios`.

### Menjalankan di web (opsional)

```bash
npx expo install react-dom react-native-web
npx expo export --platform web
```

Web hanya untuk debugging cepat. Tanpa dua paket di atas, export web akan gagal.

Akun demo pasien dari seed:

- Email: `budi.demo@example.com`, `dewi.demo@example.com`, `raka.demo@example.com`
- Password: `demo-password-123`

## 7. Migrasi ke Flutter (Direncanakan)

Tim memutuskan Flutter sebagai target klien mobile jangka panjang. Keputusan ini belum dieksekusi: belum ada kode Dart, belum ada proyek Flutter, dan belum ada tanggal cutover. Sampai cutover, `client/` tetap menjadi satu-satunya klien yang dipakai pasien.

Alasan ringkas pemilihan Flutter:

- Satu basis kode untuk Android dan iOS dengan rendering yang konsisten.
- Ekosistem widget dan akses sensor yang matang untuk kebutuhan aplikasi latihan.
- Jalur jangka panjang yang tidak bergantung pada siklus Expo SDK untuk modul native.

Prinsip yang disepakati:

1. **Parity-first.** Aplikasi Flutter harus mencapai paritas fitur dengan `client/` sebelum menggantikan klien lama. Paritas mencakup autentikasi, onboarding, enam latihan, pelacakan giroskop, grafik progres, catatan terapis, resep, dan sinkronisasi offline-safe.
2. **`client/` tetap aktif.** Jangan menghapus, membekukan, atau memindahkan `client/` sebelum cutover resmi dan uji perangkat pada build Flutter selesai.
3. **Fixture sebagai acuan.** Fixture ROM di `client/tests/fixtures/` dan algoritma di `client/utils/gyroProcessing.js` menjadi referensi perilaku yang harus direplikasi, bukan diubah agar cocok dengan implementasi baru.
4. **Backend tidak berubah.** Kontrak API di `server/` dipertahankan agar klien lama dan baru dapat hidup berdampingan selama masa transisi.

Status `mobile/`: folder ini baru berisi `mobile/README.md`. Tidak ada `pubspec.yaml`, `lib/`, maupun konfigurasi platform. Jangan menganggap Flutter sudah berjalan.

Rujukan rencana: `docs/planning/phase2-execution-plan.md` bagian 14 dan `mobile/README.md`. Detail migrasi, pemetaan fitur, dependensi, gate, dan task P2-26 sampai P2-31 ada di bagian tersebut.

## 8. Menjalankan Test

Semua perintah di bawah dijalankan dari root repositori kecuali dinyatakan lain.

```bash
# Unit test ROM (fixture sintetis, tiga latihan tambahan)
node --test client/tests/rom.test.js

# Regresi metrik murni tanpa perangkat
node client/scripts/metrics-check.js

# Verifikasi model Prisma ke database
cd server && npm test && cd ..

# Validasi input server tanpa database
cd server && npm run test:validation && cd ..

# Integration test end-to-end (butuh Docker)
cd server && npm run test:integration && cd ..

# Seed ulang data demo
cd server && npm run seed && cd ..

# Build produksi dashboard
cd therapist-dashboard && npm run build && cd ..
```

Catatan:

- `client/` belum memiliki `npm test`. Test ROM dijalankan langsung dengan `node --test`.
- `node --test client/tests/rom.test.js` memuat fixture dari `client/tests/fixtures/` melalui path relatif terhadap file test.
- `npm run test:integration` menjalankan PostgreSQL ephemeral di port `55432`, menerapkan migrasi, mengisi seed, menyalakan API di port `5055`, lalu menjalankan smoke test. Container dan datanya dihapus setelah selesai. Port dapat diubah lewat `TEST_PORT` dan `TEST_DATABASE_URL`.

### Regenerasi fixture ROM

```bash
node client/tests/generate_rom_fixtures.js
```

Generator menulis ulang 45 file fixture ke `client/tests/fixtures/`: 15 file untuk masing-masing `wrist_flexion`, `finger_extension`, dan `resistance_band_row`, dengan komposisi 10 normal dan 5 impaired per latihan. Generator memakai algoritma yang sama dengan `client/utils/gyroProcessing.js`.

### Smoke test API manual

Terminal pertama:

```bash
cd server
node server.js
```

Terminal kedua:

```bash
cd server
node scripts/smokeApi.js
```

## 9. CI

Workflow ada di `.github/workflows/ci.yml` dan berjalan pada push ke `main` serta setiap pull request. Ada dua job:

**Job `server`:**

1. Menyalakan service PostgreSQL 16.
2. `npm ci` di `server/`.
3. `npx prisma generate` dan `npx prisma validate`.
4. `npx prisma migrate deploy` lalu `npm run seed`.
5. `npm run test:validation`.
6. Menjalankan `node server.js` di background, menunggu `/api/health`, lalu `node scripts/smokeApi.js`.
7. Menjalankan `node --test client/tests/rom.test.js` dan `node client/scripts/metrics-check.js` dari root repositori.

**Job `dashboard`:**

1. `npm ci` di `therapist-dashboard/`.
2. `npm run build`.

Job server memakai secret uji (`JWT_SECRET` khusus CI) dan database sementara di service container, sehingga tidak menyentuh database produksi. Test ROM dijalankan pada path baru `client/tests/rom.test.js`.

## 10. Status Implementasi

### Phase 1 (MVP)

| Area | Status | Rujukan |
|------|--------|---------|
| Migrasi data layer ke Prisma/PostgreSQL | Selesai | Task 1 dan 2 |
| Konfigurasi environment dan keamanan dasar | Selesai | Task 3 sampai 7 |
| Penyelarasan dokumentasi produk dan engineering | Selesai | Task 8 dan 9 |
| Gap fungsional (metrik harian, catatan terapis, resep, total sesi) | Selesai | Task 10 sampai 13 |
| Refactor file mobile dan harness integrasi API | Selesai | Task 14 dan 15 |
| i18n dan tema | Ditunda | Task 16 |
| CI workflow | Tersedia di repo, status task masih terbuka | Task 17 |
| Uji perangkat fisik | Belum dijalankan | Task 20 |
| Validasi klinis target ROM | Belum, tiga target masih provisional | Task 21 |

Status detail per task ada di `docs/planning/mvp-stabilization-todo.md`. Ringkasan: fitur inti MVP terpasang dan terhubung end-to-end, tetapi uji perangkat fisik dan validasi klinis belum tercatat.

### Phase 2 dan migrasi klien

| Pekerjaan | Status |
|-----------|--------|
| Workstream A: kamera asimetri wajah | Rencana, belum dieksekusi |
| Workstream B: audio disartria | Rencana, belum dieksekusi |
| Workstream C: predictive learning | Rencana, belum dieksekusi |
| Workstream D: dashboard dan alur klinis | Rencana, belum dieksekusi |
| Validasi dan pilot 20 pasien | Rencana |
| Migrasi `client/` ke Flutter | Rencana, kode belum ada |

## 11. Catatan dan Known Issues

1. **API URL mobile dibaca dari environment.** Isi `EXPO_PUBLIC_API_URL` di `client/.env` dengan IP LAN komputer. Tanpa itu aplikasi memakai `localhost` yang hanya cocok untuk simulator atau web. Variabel yang sama juga dipakai saat build development.
2. **Target ROM sebagian masih provisional.** Target untuk `wrist_flexion` (60 derajat), `finger_extension` (30 derajat), dan `resistance_band_row` (45 derajat) belum divalidasi terapis. Test ROM memakai rentang toleransi di sekitar angka provisional tersebut, jadi test lulus bukan bukti validitas klinis.
3. **Bug siklus sesi.** State sesi hanya di-reset pada `exercise.key`, dan timer tetap berjalan saat pengguna pindah tab. Perbaikan ini menjadi prasyarat sebelum menambah modul kamera dan audio yang memakai pola state dan timer serupa.
4. **Validasi server belum seragam.** Baru field `pain` yang divalidasi ketat. Enum dan angka pada endpoint sesi lain belum mengikuti pola yang sama.
5. **Penugasan pasien ke terapis belum ada endpoint.** `Therapist.patientIds` dan `Patient.assignedTherapistId` belum sinkron, sehingga otorisasi dashboard masih bergantung pada `patientIds`.
6. **Dashboard masih mengasumsikan 10 repetisi.** `repsCompleted` di `SessionLog.jsx` selalu dibandingkan dengan angka 10, bukan target per latihan.
7. **i18n belum lengkap.** `client/i18n.js` baru mencakup sebagian teks. Task 16 ditunda.
8. **Migrasi Flutter belum dimulai.** Tidak ada kode Flutter. Jangan menghapus `client/` dan jangan menganggap fitur apa pun sudah tersedia di `mobile/`.
9. **Artefak build dan konfigurasi lokal di-gitignore.** `node_modules/`, `dist/`, `.expo/`, `.env`, `.dev.log`, `.dev.err`, dan `references/` tidak masuk repositori. Jangan memaksa `git add` untuk path tersebut.
10. **Dokumen setup dan generator Phase 2.** `ROM_SETUP.md` sudah memakai path baru. `AUDIO_SETUP.md` dan `SETUP_INSTRUCTIONS.md` masih merujuk generator audio dan wajah yang belum ada di repo, sehingga langkah tersebut berstatus rencana.

## 12. Dokumen Terkait

Produk dan proposal:

- `docs/product/prd.md` - Product requirements
- `docs/product/MVP_Spec_TechStack.md` - Spesifikasi MVP dan stack
- `docs/product/Problem_Validation_Synthesis.md` - Sintesis validasi masalah
- `docs/product/naming_and_scope_audit.md` - Audit nama dan lingkup
- `docs/proposal/deskripsi-gemastik.md` - Deskripsi proposal kompetisi

Engineering:

- `docs/engineering/tech-spec.md` - Spesifikasi teknis, termasuk keputusan stack dan struktur repo
- `docs/engineering/implementation_plan.md` - Urutan build MVP
- `docs/engineering/app-flow.md` - Alur navigasi aplikasi
- `docs/engineering/design-brief.md` - Sistem visual dan UX
- `docs/engineering/rules.md` - Aturan coding
- `docs/engineering/roadmap-phase2-3.md` - Roadmap Phase 2 dan 3

Perencanaan:

- `docs/planning/mvp-stabilization-plan.md` - Rencana stabilisasi MVP
- `docs/planning/mvp-stabilization-todo.md` - Checklist status task
- `docs/planning/phase2-execution-plan.md` - Rencana eksekusi Phase 2
- `docs/planning/phase2/Phase_2_Minimal_Fast_Track.md` - Jalur cepat Phase 2
- `docs/planning/phase2/Phase_2_Clinical_Validation_Plan.md` - Rencana validasi klinis
- `docs/planning/phase2/Integration_Phase2_with_Proposal_Timeline.md` - Integrasi dengan timeline proposal
- `docs/planning/phase2/Phase_2_Resources_Cheatsheet.md` - Ringkasan sumber daya
- `docs/planning/archive/Week1_ExecutionPlan.md` - Arsip rencana minggu pertama

Setup dan manual:

- `docs/setup/ROM_SETUP.md` - Penyiapan fixture ROM
- `docs/setup/AUDIO_SETUP.md` - Penyiapan fixture audio
- `docs/setup/SETUP_INSTRUCTIONS.md` - Penyiapan fixture facial
- `docs/manuals/PATIENT_MANUAL.md` - Manual pasien
- `docs/manuals/THERAPIST_MANUAL.md` - Manual terapis

Status klien:

- `mobile/README.md` - Status dan aturan migrasi Flutter
- `AGENTS.md` - Instruksi kerja untuk AI coding agents

## 13. Atribusi

Arsitektur pelacakan ROM (integrasi giroskop, offline-first sync, deteksi repetisi berbasis hysteresis) dikembangkan sendiri oleh tim RehabTrack berdasarkan riset biomekanik dan literatur rehabilitasi pasca-stroke. Repository referensi di `references/` dipakai sebagai bahan pembelajaran dan tidak termasuk dalam produk.
