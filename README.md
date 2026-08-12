# STROKE-GEMASTIK / PulihTrack

Aplikasi rehabilitasi pasca-stroke berbasis ponsel untuk pasien dan dashboard web untuk terapis. Pasien mencatat latihan Range of Motion (ROM) menggunakan sensor gyroscope, melihat progres, dan melakukan pemeriksaan tambahan (simetri wajah & kejelasan bicara). Terapis dapat memantau progres pasien, memberikan catatan mingguan, dan melakukan video call.

> **Catatan lingkup:** Dokumen perencanaan MVP (`implementation_plan.md`) awalnya tidak menyertakan fitur kamera/audio/ML. Saat ini codebase sudah memasuki **roadmap Phase 2** dengan fitur tambahan *facial asymmetry* dan *speech clarity assessment*.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Mobile app | React Native + Expo SDK 57 |
| Web dashboard | React + Vite 5 |
| Backend | Node.js + Express + Mongoose |
| Database | MongoDB Atlas / lokal |
| Auth | JWT + bcryptjs |
| Charts | react-native-chart-kit (mobile), recharts (web) |
| Face detection | react-native-vision-camera + face-detector (Phase 2) |
| Audio | expo-audio + TensorFlow.js (Phase 2) |

---

## Struktur Folder

```
STROKE-GEMASTIK/
├── client/                 # Aplikasi pasien (Expo)
│   ├── screens/            # Auth, ExerciseSelect, ExerciseSession, Progress, FaceCheck, SpeechCheck
│   ├── components/         # GyroSensor, ROMChart, SessionCard, SessionSummary
│   ├── api/client.js       # HTTP client + sync logic
│   └── utils/              # gyroProcessing, storage, faceMetrics, constants, i18n
├── therapist-dashboard/    # Dashboard terapis (Vite + React)
│   ├── src/pages/          # Login, PatientList, PatientDetail
│   ├── src/components/     # ROMTrendChart, SessionLog, WeeklyNoteEditor, AssessmentSummary
│   └── src/api/            # therapistAPI.js
├── server/                 # REST API
│   ├── models/             # Patient, Therapist, Session, TherapistNote, Assessment
│   ├── routes/             # auth, sessions, patient, therapist, assessments
│   ├── middleware/         # authMiddleware.js
│   ├── scripts/            # verifyModels, smokeApi, verifySessions, dll.
│   └── seed.js             # Data demo
├── data/                   # Test fixture generator & unit tests
├── prd.md, tech-spec.md, implementation_plan.md
├── app-flow.md, design-brief.md, rules.md
└── README.md
```

---

## Prasyarat

- Node.js 18+ (direkomendasikan LTS terbaru)
- MongoDB Atlas atau instance MongoDB lokal
- Expo CLI / `npx expo`
- Perangkat fisik atau emulator Android/iOS untuk uji mobile

---

## 1. Setup Backend

### MongoDB lokal dengan Podman

Jika memakai MongoDB lokal melalui Podman:

```powershell
podman machine start stroke-vm
podman start stroke-mongo
```

Jika container belum pernah dibuat:

```powershell
podman run -d --name stroke-mongo -p 27017:27017 `
  -e MONGO_INITDB_ROOT_USERNAME=admin `
  -e MONGO_INITDB_ROOT_PASSWORD=secret `
  mongo:6
```

Gunakan URI berikut di `server/.env`:

```env
MONGO_URI=mongodb://admin:secret@localhost:27017/strokeapp?authSource=admin
```

```bash
cd server
cp .env.example .env
# Edit .env dan isi MONGO_URI, JWT_SECRET, serta CORS_ORIGIN
npm install
npm run seed      # Buat data demo
npm test          # Verifikasi model ke database
node server.js    # Jalankan server di http://localhost:5000
```

Pada PowerShell, gunakan `Copy-Item .env.example .env` sebagai pengganti `cp`.

**Contoh `.env`:**

```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/strokeapp
JWT_SECRET=super-random-secret-min-32-char
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:19006
```

**Endpoint utama:**

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register-patient` | Daftar pasien |
| POST | `/api/auth/login` | Login pasien |
| POST | `/api/auth/login-therapist` | Login terapis |
| GET | `/api/patient/me` | Profil pasien |
| POST/GET | `/api/patient/sessions` | Sesi pasien |
| POST/GET | `/api/patient/assessments` | Assessment Phase 2 |
| GET | `/api/therapist/patients` | Daftar pasien terapis |
| GET | `/api/therapist/patients/:id` | Detail pasien |
| PATCH | `/api/therapist/patients/:id/notes` | Catatan mingguan |
| PATCH | `/api/therapist/patients/:id/sessions/:sessionId/review` | Review sesi |

---

## 2. Setup Therapist Dashboard

```bash
cd therapist-dashboard
npm install
# Buat file .env.local jika backend tidak di localhost:5000
# VITE_API_URL=http://localhost:5000/api
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
2. Edit `client/utils/constants.js` dan ganti `<your-local-ip>` dengan IP lokal komputer Anda.
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
# Synthetic validation suite: 25 tests
node --test data/facial_asymmetry.test.js data/dysarthria.test.js data/rom.test.js

# Backend model verification
Push-Location server
npm test
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

---

## Status Implementasi

Berdasarkan `implementation_plan.md`:

| Phase | Status |
|-------|--------|
| 0 — Scaffolding | ✅ Selesai |
| 1 — Backend data layer + auth | ✅ Selesai |
| 2 — Session & therapist APIs | ✅ Selesai |
| 3 — Mobile ROM tracking | ✅ Selesai (3 latihan inti + 3 latihan Phase 2) |
| 4 — Progress + navigation | ✅ Selesai |
| 5 — Mobile ↔ backend sync | ✅ Selesai (offline-safe) |
| 6 — Therapist dashboard | ✅ Selesai |
| 7 — Localization | ⚠️ Ada `i18n.js`, belum 100% coverage |
| 8 — Polish & pilot readiness | ⚠️ Seed & manual ada, real-device testing belum tercatat |
| Phase 2 — Face & speech assessments | ✅ Sudah dimulai |

**Kesimpulan:** MVP sudah sekitar **85–90%**, dengan Phase 2 sudah mulai diimplementasikan.

---

## Catatan & Known Issues

1. **API URL client masih placeholder** — ganti `<your-local-ip>` di `client/utils/constants.js` dengan IP komputer yang bisa diakses ponsel.
2. **Phase 2 native build diperlukan** — face detector wrapper berbasis native module tidak berjalan penuh di Expo Go. Gunakan `npx expo prebuild` lalu `npx expo run:android` untuk development build.
3. **Synthetic fixtures bukan validasi klinis** — hasil facial, audio, dan ROM hanya smoke test algoritma. Jangan gunakan pass rate-nya sebagai sensitivity/specificity pasien nyata.
4. **Target ROM latihan tambahan provisional** — validasi target `wrist_flexion`, `finger_extension`, dan `resistance_band_row` dengan terapis sebelum pilot.

---

## Dokumen Terkait

- `prd.md` — Product requirements
- `tech-spec.md` — Spesifikasi teknis lengkap
- `implementation_plan.md` — Urutan build MVP
- `app-flow.md` — Alur navigasi aplikasi
- `design-brief.md` — Sistem visual & UX
- `rules.md` — Aturan coding
- `PATIENT_MANUAL.md` — Manual pasien
- `THERAPIST_MANUAL.md` — Manual terapis
