# STROKE-GEMASTIK / RehabTrack

**RehabTrack: Sistem Monitoring Rehabilitasi Pasca-Stroke Berbasis Smartphone dengan Pelacakan Range-of-Motion Menggunakan Gyroscope dan Tele-Supervision Asinkron**

Aplikasi rehabilitasi pasca-stroke berbasis ponsel untuk pasien dan dashboard web untuk terapis. Pasien mencatat latihan Range of Motion (ROM) menggunakan sensor gyroscope, melihat progres, dan terapis memantau kemajuan pasien, memberikan catatan mingguan, serta melakukan video call secara asinkron.

> **Catatan lingkup:** Implementasi saat ini dibatasi pada fitur **Phase 1 (MVP)**: pelacakan ROM berbasis gyroscope + tele-supervision asinkron. Fitur Phase 2 (kamera/audio/ML) ditunda dan didokumentasikan di `docs/engineering/roadmap-phase2-3.md`.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Mobile app | React Native + Expo SDK 57 |
| Web dashboard | React + Vite 5 |
| Backend | Node.js + Express + Prisma |
| Database | PostgreSQL (Supabase / lokal) |
| Auth | JWT + bcryptjs |
| Charts | react-native-chart-kit (mobile), recharts (web) |

---

## Struktur Folder

```
STROKE-GEMASTIK/
├── client/                 # Aplikasi pasien (Expo)
│   ├── screens/            # Auth, ExerciseSelect, ExerciseSession, Progress
│   ├── components/         # GyroSensor, ROMChart, SessionCard, SessionSummary
│   ├── api/client.js       # HTTP client + sync logic
│   └── utils/              # gyroProcessing, storage, constants, i18n
├── therapist-dashboard/    # Dashboard terapis (Vite + React)
│   ├── src/pages/          # Login, PatientList, PatientDetail
│   ├── src/components/     # ROMTrendChart, SessionLog, WeeklyNoteEditor
│   └── src/api/            # therapistAPI.js
├── server/                 # REST API
│   ├── routes/             # auth, sessions, patient, therapist
│   ├── middleware/         # authMiddleware.js
│   ├── prisma/             # Schema + migrations (PostgreSQL)
│   ├── scripts/            # smokeApi, verifikasi
│   └── seed.js             # Data demo
├── data/                   # Fixture ROM + unit test
├── docs/                   # Dokumen perencanaan & spesifikasi
│   ├── product/            # PRD, validasi masalah, audit scope
│   ├── engineering/        # Tech spec, implementation plan, app flow, design, rules, roadmap
│   ├── planning/           # Execution plans
│   └── manuals/            # Manual pasien & terapis
├── AGENTS.md               # Instruksi untuk AI coding agents
└── README.md
```

---

## Prasyarat

- Node.js 18+ (direkomendasikan LTS terbaru)
- Akun Supabase (gratis) atau PostgreSQL lokal
- Expo CLI / `npx expo`
- Perangkat fisik atau emulator Android/iOS untuk uji mobile

---

## 1. Setup Backend

Backend menggunakan **PostgreSQL** melalui **Prisma ORM**. Database bisa di-host di **Supabase** (cloud) atau dijalankan secara lokal via Docker/Podman.

### Opsi A: Supabase (Rekomendasi)

1. Buat project di [supabase.com](https://supabase.com).
2. Di Project Settings → Database, copy **URI** connection string.
3. Paste ke `server/.env` sebagai `DATABASE_URL`.

**Contoh `.env`:**

```env
PORT=5000
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
JWT_SECRET=super-random-secret-min-32-char
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:19006
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
```

### Opsi B: PostgreSQL Lokal dengan Docker

Jika tidak ingin pakai Supabase:

```powershell
docker run -d --name stroke-postgres -p 5432:5432 `
  -e POSTGRES_USER=admin `
  -e POSTGRES_PASSWORD=secret `
  -e POSTGRES_DB=strokeapp `
  postgres:16
```

```env
DATABASE_URL=postgresql://admin:secret@localhost:5432/strokeapp
```

### Jalankan Backend

```bash
cd server
cp .env.example .env
# Edit .env dan isi DATABASE_URL, JWT_SECRET, serta CORS_ORIGIN
npm install
npx prisma migrate dev   # Buat tabel di PostgreSQL
npx prisma generate      # Generate Prisma Client
npm run seed             # Buat data demo
npm test                 # Verifikasi model ke database
node server.js           # Jalankan server di http://localhost:5000
```

Pada PowerShell, gunakan `Copy-Item .env.example .env` sebagai pengganti `cp`.

**Endpoint utama:**

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register-patient` | Daftar pasien |
| POST | `/api/auth/login` | Login pasien |
| POST | `/api/auth/login-therapist` | Login terapis |
| GET | `/api/patient/me` | Profil pasien |
| GET | `/api/patient/notes` | Catatan mingguan terapis untuk pasien |
| GET | `/api/patient/prescription?exercise=` | Resep aktif per latihan |
| POST/GET | `/api/patient/sessions` | Sesi pasien |
| GET | `/api/therapist/patients` | Daftar pasien terapis |
| GET | `/api/therapist/patients/:id` | Detail pasien |
| PATCH | `/api/therapist/patients/:id/notes` | Catatan mingguan |
| PATCH | `/api/therapist/patients/:id/sessions/:sessionId/review` | Review sesi |
| PUT | `/api/therapist/patients/:id/prescription` | Simpan resep latihan |

---

## 2. Setup Therapist Dashboard

```bash
cd therapist-dashboard
npm install
# Buat file .env.local
# VITE_API_URL=http://localhost:5000/api
# VITE_THERAPIST_CALL_URL=https://meet.google.com/abc-defg-hij
npm run dev       # http://localhost:5173
npm run build     # Build production ke dist/
```

Login menggunakan akun demo dari seed:

- **Email:** `terapis.demo@example.com`
- **Password:** `demo-password-123`

---

## 3. Setup Mobile App (Client)

```bash
cd client
npm install
```

### Menjalankan di perangkat fisik

1. Pastikan ponsel dan komputer berada di jaringan yang sama.
2. Salin `client/.env.example` menjadi `client/.env`, lalu isi `EXPO_PUBLIC_API_URL` dengan IP lokal komputer (bukan localhost) dan `EXPO_PUBLIC_THERAPIST_CALL_URL` dengan link video call.
3. Jalankan:

```bash
npx expo start
```

4. Scan QR code dengan **Expo Go** (Android) atau kamera (iOS).

### Menjalankan di web (opsional)

Web export membutuhkan instalasi tambahan:

```bash
npx expo install react-dom react-native-web
npx expo export --platform web
```

> Tanpa instalasi di atas, web export akan gagal. Fitur inti aplikasi ini memang dirancang untuk mobile; web hanya untuk debugging cepat.

Akun demo pasien dari seed:

- **Email:** `budi.demo@example.com`, `dewi.demo@example.com`, `raka.demo@example.com`
- **Password:** `demo-password-123`

---

## Menjalankan Test

```powershell
# ROM fixture test
node --test data/rom.test.js

# Backend model verification
Push-Location server
npm test
Pop-Location

# Backend validation tests (tanpa database)
Push-Location server
npm run test:validation
Pop-Location

# Integration test end-to-end (butuh Docker)
Push-Location server
npm run test:integration
Pop-Location

# Seed demo data
Push-Location server
npm run seed
Pop-Location

# Therapist dashboard production build
Push-Location therapist-dashboard
npm run build
Pop-Location
```

API smoke test membutuhkan server berjalan. Pada PowerShell, jalankan server di terminal pertama:

```powershell
cd server
node server.js
```

Lalu di terminal kedua:

```powershell
cd server
node scripts/smokeApi.js
```

Integration test `npm run test:integration` menjalankan PostgreSQL ephemeral di port `55432`, menerapkan migrasi, mengisi seed, menyalakan API di port `5055`, lalu menjalankan smoke test. Container dan datanya dihapus setelah selesai, sehingga tidak menyentuh database produksi. Port dapat diubah lewat `TEST_PORT` dan `TEST_DATABASE_URL`.

---

## Status Implementasi

Berdasarkan `docs/engineering/implementation_plan.md`:

| Phase | Status |
|-------|--------|
| 0 — Scaffolding | ✅ Selesai |
| 1 — Backend data layer + auth | ✅ Selesai |
| 2 — Session & therapist APIs | ✅ Selesai |
| 3 — Mobile ROM tracking | ✅ Selesai |
| 4 — Progress + navigation | ✅ Selesai |
| 5 — Mobile ↔ backend sync | ✅ Selesai (offline-safe) |
| 6 — Therapist dashboard | ✅ Selesai |
| 7 — Localization | ⚠️ Ada `i18n.js`, belum 100% coverage |
| 8 — Polish & pilot readiness | ⚠️ Seed & manual ada, real-device testing belum tercatat |

**Fitur yang sudah terhubung:** catatan terapis muncul di tab Catatan pasien, review sesi tersimpan di server, dan dashboard terapis dapat menyimpan target ROM, batas aman, serta target repetisi per latihan.

**Kesimpulan:** MVP (Phase 1) sudah sekitar **90%**. Enam latihan, catatan terapis untuk pasien, review sesi persisten, dan editor resep latihan sudah terimplementasi. Fitur Phase 2 (kamera/audio/ML) ditunda sesuai keputusan scope terbaru. Sisa utama: uji perangkat fisik, validasi klinis target ROM, dan perluasan i18n.

---

## Catatan & Known Issues

1. **API URL client dibaca dari environment** — isi `EXPO_PUBLIC_API_URL` di `client/.env` dengan IP komputer yang bisa diakses ponsel. Tanpa itu, aplikasi memakai `localhost` yang hanya cocok untuk simulator atau web.
2. **Target ROM latihan tambahan provisional** — validasi target `wrist_flexion`, `finger_extension`, dan `resistance_band_row` dengan terapis sebelum pilot.

---

## Dokumen Terkait

- `docs/product/prd.md` — Product requirements
- `docs/engineering/tech-spec.md` — Spesifikasi teknis lengkap
- `docs/engineering/implementation_plan.md` — Urutan build MVP
- `docs/engineering/app-flow.md` — Alur navigasi aplikasi
- `docs/engineering/design-brief.md` — Sistem visual & UX
- `docs/engineering/rules.md` — Aturan coding
- `docs/engineering/roadmap-phase2-3.md` — Roadmap Phase 2 & 3
- `docs/manuals/PATIENT_MANUAL.md` — Manual pasien
- `docs/manuals/THERAPIST_MANUAL.md` — Manual terapis

## Atribusi

Arsitektur pelacakan ROM (integrasi giroskop, offline-first sync, deteksi rep berbasis hysteresis) dikembangkan sendiri oleh tim RehabTrack berdasarkan riset biomechanics dan literatur terkait rehabilitasi pasca-stroke.
