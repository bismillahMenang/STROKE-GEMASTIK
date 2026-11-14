# Technical Specification
## RehabTrack — MVP Architecture

**Version:** 1.2
**Companion to:** `../product/prd.md`
**Last updated:** 2026-11-14

---

## 1. System Overview

Three deployable units:

```
client/                -> React Native (Expo) mobile app, patient-facing
therapist-dashboard/   -> React (Vite) web app, therapist-facing
server/                -> Node.js + Express API, shared backend
```

All clients use one PostgreSQL database through the backend API. No client talks to the database directly.

```
[Patient phone] --HTTPS--> [Express API] <--HTTPS-- [Therapist browser]
                                 |
                         [PostgreSQL / Supabase]
                                 |
                         [Prisma ORM]
```

---

## 2. Tech Stack — Fixed Decisions

Do not substitute libraries or change the data model without updating this document first.

| Layer | Choice | Version | Reason |
|---|---|---|---|
| Mobile framework | React Native via Expo | Expo SDK 57, React Native 0.86, React 19.2 | Managed workflow, built-in sensor APIs |
| Mobile navigation | `@react-navigation/native` + `@react-navigation/bottom-tabs` | v7 | Standard navigation |
| Mobile sensors | `expo-sensors` (Gyroscope) | SDK 57 | Native gyroscope access without ejecting |
| Mobile audio | `expo-audio` | SDK 57 | Target and ceiling cues |
| Mobile local storage | `@react-native-async-storage/async-storage` | latest | Offline-first session storage |
| Mobile HTTP client | `axios` | latest | Shared API client |
| Mobile charts | `react-native-chart-kit` + `react-native-svg` | latest | ROM trend chart |
| Web framework | React via Vite | React 18, Vite 5 | Fast dev server and simple build |
| Web charts | `recharts` | v3 | Dashboard-style charts |
| Web HTTP client | `axios` | latest | Shared API pattern |
| Web routing | `react-router-dom` | v6 | Standard |
| Backend runtime | Node.js | 18 LTS+ | JavaScript end-to-end |
| Backend framework | Express | 4.x | Minimal and well understood |
| Auth rate limiting | `express-rate-limit` | 7.x | Limits login and register attempts per IP |
| Database | PostgreSQL | 16 (Supabase or local Docker) | Relational integrity and migrations |
| ORM | Prisma | 6.x | Typed schema, migrations, and client |
| Auth | `jsonwebtoken` + `bcryptjs` | latest | Stateless JWT, hashed passwords |
| Backend hosting | Render.com or Railway | — | Free tier and auto-deploy |
| Web hosting | Vercel | — | Free tier and auto-deploy |
| Video calls | External Google Meet or Zoom link | — | No in-app video infrastructure |

The MVP baseline does not require ML, computer vision, or audio inference libraries.

### 2.1 Roadmap Phase 2 dependency authorization

Roadmap Phase 2 is approved to start without an MVP or pilot entry gate. The following dependencies are approved for roadmap Phase 2 implementation.

| Capability | Approved dependency | Constraint |
|---|---|---|
| Camera capture | `expo-camera` | Expo SDK 57-compatible release, request camera permission. |
| Face landmark processing | `@mediapipe/tasks-vision` or a maintained React Native wrapper | Process frames on-device. |
| Audio capture | `expo-audio` | Expo SDK 57-compatible release, do not start new work with `expo-av`. |
| On-device audio inference | `@tensorflow/tfjs` + `@tensorflow/tfjs-react-native` + `expo-gl`, or a smaller runtime | Select and benchmark during Phase 2. Raw audio stays local. |

Phase 2 native face implementation may use `react-native-vision-camera-face-detector` with its required peers. These approvals authorize dependency use, not a claim that every runtime combination is production-ready.

---

## 3. Repository Structure

```
STROKE-GEMASTIK/
├── client/
│   ├── App.js
│   ├── screens/
│   │   ├── AuthScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── ExerciseSelect.js
│   │   ├── ExerciseSession.js
│   │   ├── ProgressDashboard.js
│   │   ├── TherapistNotesScreen.js
│   │   └── GyroTestScreen.js
│   ├── components/
│   │   ├── ExerciseCard.js
│   │   ├── GyroSensor.js
│   │   ├── ROMChart.js
│   │   ├── SessionCard.js
│   │   └── SessionSummary.js
│   ├── api/client.js
│   ├── theme/ThemeContext.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── gyroProcessing.js
│   │   ├── progressMetrics.js
│   │   ├── prescription.js
│   │   ├── soundManager.js
│   │   ├── storage.js
│   │   └── streak.js
│   ├── i18n.js
│   └── assets/
├── therapist-dashboard/
│   ├── src/
│   │   ├── pages/Login.jsx
│   │   ├── pages/PatientList.jsx
│   │   ├── pages/PatientDetail.jsx
│   │   ├── components/ROMTrendChart.jsx
│   │   ├── components/SessionLog.jsx
│   │   ├── components/WeeklyNoteEditor.jsx
│   │   ├── api/therapistAPI.js
│   │   └── App.jsx
│   └── vite.config.js
├── server/
│   ├── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── lib/prisma.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── patient.js
│   │   ├── sessions.js
│   │   └── therapist.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── rateLimit.js
│   ├── utils/validation.js
│   ├── scripts/
│   ├── seed.js
│   └── .env.example
├── data/
│   ├── rom.test.js
│   ├── generate_rom_fixtures.js
│   └── test/fixtures/
├── docs/
│   ├── product/
│   ├── engineering/
│   ├── planning/
│   └── manuals/
├── AGENTS.md
└── README.md
```

---

## 4. Database Schema (PostgreSQL / Prisma)

Source of truth: `server/prisma/schema.prisma`.

### 4.1 `Patient`

Primary key: `id` (UUID string). Email is unique and stored lowercase.

| Field | Type | Notes |
|---|---|---|
| `id` | String | UUID, primary key |
| `name` | String | required |
| `email` | String | unique, normalized lowercase |
| `phone` | String? | optional |
| `passwordHash` | String | bcrypt hash |
| `diagnosis` | String? | optional |
| `assignedTherapistId` | String? | therapist UUID |
| `language` | `Language` | `id` or `en`, default `id` |
| `createdAt` | DateTime | automatic |
| `updatedAt` | DateTime | automatic |

Relations: `sessions`, `notes`, `prescriptions`.

### 4.2 `Therapist`

Primary key: `id` (UUID string). Email is unique.

| Field | Type | Notes |
|---|---|---|
| `id` | String | UUID, primary key |
| `name` | String | required |
| `email` | String | unique, normalized lowercase |
| `passwordHash` | String | bcrypt hash |
| `licenseNumber` | String? | optional |
| `clinic` | String? | optional |
| `patientIds` | String[] | assigned patients, denormalized |
| `createdAt` | DateTime | automatic |
| `updatedAt` | DateTime | automatic |

Relations: `notes`.

### 4.3 `Session`

Primary key: `id` (UUID string). Foreign key to `Patient` with cascade delete.

| Field | Type | Notes |
|---|---|---|
| `id` | String | UUID, primary key |
| `patientId` | String | required, FK to Patient |
| `date` | DateTime | required |
| `exercise` | `Exercise` | exercise enum |
| `peakRom` | Float? | degrees |
| `avgRom` | Float? | degrees |
| `repsCompleted` | Int? | repetition count |
| `consistency` | `Consistency?` | `low`, `medium`, `high` |
| `pain` | `PainLevel?` | `none`, `mild`, `stopped` |
| `avgSmoothness` | Float? | score 0 to 1 |
| `ceilingHits` | Int? | times the safe ceiling was exceeded |
| `prescriptionSource` | String? | `server`, `cache`, or `default` |
| `notes` | String? | patient free text |
| `gyroRawSampleCount` | Int? | sample count only, not raw data |
| `syncedAt` | DateTime? | sync timestamp |
| `reviewStatus` | `ReviewStatus` | `unreviewed`, `good`, `attention` |
| `createdAt` | DateTime | automatic |
| `updatedAt` | DateTime | automatic |

### 4.4 `TherapistNote`

Primary key: `id` (UUID string). Foreign keys to `Therapist` and `Patient`.

| Field | Type | Notes |
|---|---|---|
| `id` | String | UUID, primary key |
| `therapistId` | String | required, FK to Therapist |
| `patientId` | String | required, FK to Patient |
| `weekNumber` | Int | program week |
| `note` | String | required |
| `templateKey` | String? | note template |
| `createdAt` | DateTime | automatic |
| `updatedAt` | DateTime | automatic |

### 4.5 `Prescription`

Primary key: `id` (UUID string). Unique per `patientId` and `exercise`.

| Field | Type | Notes |
|---|---|---|
| `id` | String | UUID, primary key |
| `patientId` | String | required, FK to Patient |
| `exercise` | `Exercise` | exercise enum |
| `targetRom` | Float | target degrees |
| `romCeiling` | Float | safety ceiling, must be >= targetRom |
| `targetReps` | Int | target repetitions |
| `isActive` | Boolean | default true |
| `createdAt` | DateTime | automatic |
| `updatedAt` | DateTime | automatic |

The `Assessment` model was removed in migration `20260813120000_drop_phase2_assessments`. Phase 2 camera and audio data is processed on-device and is not stored on the server.

### 4.6 Enums

- `Language`: `id`, `en`
- `Exercise`: `forearm_supination`, `shoulder_abduction`, `elbow_flexion`, `wrist_flexion`, `finger_extension`, `resistance_band_row`
- `Consistency`: `low`, `medium`, `high`
- `PainLevel`: `none`, `mild`, `stopped`
- `ReviewStatus`: `unreviewed`, `good`, `attention`

### 4.7 Indexes and constraints

- `Session`: `@@index([patientId, date])` for per-patient history.
- `Patient` and `Therapist`: unique index on `email`.
- `Prescription`: `@@unique([patientId, exercise])` for one active plan per exercise.

---

## 5. API Specification

Base URL: `/api`

All protected routes use `Authorization: Bearer <JWT>`. `authMiddleware.js` validates the token and attaches `req.user = { id, role }`.

### 5.1 Auth

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register-patient` | none | `{ name, email, password, phone? }` | `{ token, patient }` |
| POST | `/auth/login` | none | `{ email, password }` | `{ token, role: 'patient' }` |
| POST | `/auth/login-therapist` | none | `{ email, password }` | `{ token, role: 'therapist' }` |

Auth routes are rate limited by `express-rate-limit`. Email input is trimmed and lowercased. New passwords must be at least 8 characters.

### 5.2 Patient-facing (requires patient JWT)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/patient/me` | — | `{ patient }` |
| GET | `/patient/notes?limit=8` | — | `{ notes: [TherapistNote] }` |
| GET | `/patient/prescription?exercise=...` | — | `{ prescription }` or `{ prescription: null }` |
| POST | `/patient/sessions` | Session fields minus `id` and `patientId` | `{ session }` |
| GET | `/patient/sessions?limit=8` | — | `{ sessions: [Session] }` |
| PATCH | `/patient/sessions/:sessionId` | `{ notes }` | `{ session }` |

### 5.3 Therapist-facing (requires therapist JWT)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/therapist/patients` | — | `{ patients: [{ id, name, lastSessionDate, trend }] }` |
| GET | `/therapist/patients/:patientId` | — | `{ patient, sessions, notes, prescriptions, totalSessions, totalReps }` |
| PATCH | `/therapist/patients/:patientId/notes` | `{ weekNumber, note, templateKey? }` | `{ note }` |
| PATCH | `/therapist/patients/:patientId/sessions/:sessionId/review` | `{ reviewStatus }` | `{ session }` |
| PUT | `/therapist/patients/:patientId/prescription` | `{ exercise, targetRom, romCeiling, targetReps }` | `{ prescription }` |

Therapist access is checked against `Therapist.patientIds`.

### 5.4 Health check

| Method | Path | Response |
|---|---|---|
| GET | `/health` | `{ status: 'OK', time }` |

### 5.5 Error format

```json
{ "error": true, "message": "Human-readable message" }
```

---

## 6. Core Algorithms

### 6.1 ROM integration

Input: gyroscope Z-axis angular velocity in radians per second, sampled every 100 ms.

```javascript
function calculateROM(gyroZReadings, samplingIntervalSec = 0.1) {
  let angle = 0;
  const angleTrace = [];

  for (const z of gyroZReadings) {
    angle += z * samplingIntervalSec * (180 / Math.PI);
    angleTrace.push(Math.abs(angle));
  }

  const peakRom = Math.max(...angleTrace);
  const avgRom = angleTrace.reduce((sum, value) => sum + value, 0) / angleTrace.length;
  const consistency = calculateConsistency(angleTrace);

  return { peakRom, avgRom, consistency };
}
```

Raw gyroscope arrays stay on-device. Only computed summary metrics are sent to the server.

### 6.2 Consistency

Local maxima of the angle trace are compared with their mean. Relative standard deviation below 10 percent is `high`, below 25 percent is `medium`, otherwise `low`.

### 6.3 Smoothness

`calculateSmoothness` computes the RMS third difference of the angle trace and maps it to 0..1 with `1 / (1 + rms / scale)`. The scale is provisional and marked `TODO(clinical/tune)`.

### 6.4 Rep detection

A repetition is counted when the angle rises above `targetRom * 0.45` and then returns below `targetRom * 0.18`. Both ratios are provisional pending clinical validation.

### 6.5 Prescription resolution

The client resolves a prescription in this order:

1. Live server response from `GET /patient/prescription`.
2. Last cached prescription in AsyncStorage.
3. Built-in exercise defaults.

The server response always wins when available. A missing or failed request never blocks a session.

---

## 7. Privacy and Data Handling

- Raw gyroscope time-series arrays stay on-device. Only aggregated metrics sync to the server.
- Passwords are hashed with `bcryptjs` and are never returned in API responses or logs.
- `.env` files containing `DATABASE_URL`, `JWT_SECRET`, and other secrets are never committed.
- Development and test data must use clearly fictional names and emails.
- Phase 2 camera and audio inputs are processed on-device. Raw frames and recordings are not uploaded by default.
- Audio capture requires explicit consent before recording.
- The MVP is not a HIPAA or GDPR-compliant system. Encryption at rest, audit logging, and formal consent flows are Phase 3 concerns.

---

## 8. Environment Configuration

### 8.1 Server

`server/.env.example`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=replace-with-strong-random-secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:19006
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
```

`CORS_ORIGIN` accepts a comma-separated allowlist. Requests without an `Origin` header are allowed for mobile and server-to-server calls. In production, an empty allowlist blocks browser clients.

### 8.2 Mobile client

`client/.env.example`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
EXPO_PUBLIC_THERAPIST_CALL_URL=https://meet.google.com/abc-defg-hij
```

Expo exposes `EXPO_PUBLIC_*` variables to the app bundle. A physical device must use the computer's LAN IP, not `localhost`.

### 8.3 Therapist dashboard

`therapist-dashboard/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_THERAPIST_CALL_URL=https://meet.google.com/abc-defg-hij
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Mobile app cold start | < 3s on a 3-year-old mid-range Android device |
| Gyroscope sampling rate | 10 Hz (100 ms interval) |
| API response time | < 500 ms for all endpoints under pilot load (<100 concurrent users) |
| Offline tolerance | Record and save sessions with zero connectivity, sync on reconnect |
| Browser support (therapist dashboard) | Latest 2 versions of Chrome, Safari, Edge |
| Accessibility | Minimum tap target 44x44 pt, body text minimum 14 px, color contrast AA |

---

## 10. Dependency Boundaries

The following remain outside the approved MVP and Phase 2 scope:

- No push notification libraries.
- No payment or billing SDKs.
- No third-party auth providers. Plain JWT remains sufficient.
- No raw camera or audio uploads to the server.
- No analytics or tracking SDKs.

Camera, audio, MediaPipe, and TensorFlow dependencies listed in section 2.1 are approved for roadmap Phase 2. `expo-av` is not approved for new work because the current Expo SDK 57 stack provides `expo-audio`.

---

## 11. Related Documents

- `../product/prd.md` — product requirements
- `implementation_plan.md` — MVP build sequence
- `app-flow.md` — screen and navigation behavior
- `design-brief.md` — visual system
- `roadmap-phase2-3.md` — Phase 2 and Phase 3 roadmap
- `rules.md` — coding and scope constraints
