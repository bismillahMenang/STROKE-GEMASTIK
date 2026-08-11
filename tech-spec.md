# Technical Specification
## StrokeApp — MVP Architecture

**Version:** 1.0
**Companion to:** `prd.md`

---

## 1. System Overview

Three deployable units:

```
client/                → React Native (Expo) mobile app — patient-facing
therapist-dashboard/   → React (Vite) web app — therapist-facing
server/                → Node.js + Express API — shared backend
```

All three share one MongoDB database via the backend API. No client talks to the database directly.

```
[Patient phone] --HTTPS--> [Express API] <--HTTPS-- [Therapist browser]
                                 |
                             [MongoDB Atlas]
```

---

## 2. Tech Stack — Fixed Decisions (do not substitute without updating this doc)

| Layer | Choice | Version | Reason |
|---|---|---|---|
| Mobile framework | React Native via Expo (managed workflow) | Expo SDK 50+ | Fastest path to iOS+Android, built-in sensor APIs, no native build step needed for MVP |
| Mobile navigation | `@react-navigation/native` + `@react-navigation/bottom-tabs` | latest stable | Standard, well-documented |
| Mobile sensors | `expo-sensors` (Gyroscope) | bundled with Expo SDK | Native gyroscope access without ejecting |
| Mobile local storage | `@react-native-async-storage/async-storage` | latest stable | Offline-first session storage |
| Mobile HTTP client | `axios` | latest stable | Consistent with web client |
| Mobile charts | `react-native-chart-kit` | latest stable | Simplest chart lib compatible with Expo |
| Web framework | React via Vite | React 18, Vite 5 | Fast dev server, simple build |
| Web charts | `recharts` | latest stable | Better fit for dashboard-style charts than chart-kit |
| Web HTTP client | `axios` | latest stable | — |
| Web routing | `react-router-dom` | v6 | Standard |
| Backend runtime | Node.js | 18 LTS+ | Matches JS-everywhere strategy |
| Backend framework | Express | 4.x | Minimal, well-understood |
| Database | MongoDB (Atlas free tier for MVP) | 6.x | Schemaless, fast to iterate, sufficient for pilot scale (<100 users) |
| ODM | Mongoose | 8.x | Schema validation on top of MongoDB |
| Auth | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` | latest stable | Simple stateless auth, no third-party auth provider needed for MVP |
| Backend hosting | Render.com (or Railway) | — | Free tier, auto-deploy from GitHub |
| Web hosting | Vercel | — | Free tier, auto-deploy from GitHub |
| Video calls | External Zoom or Google Meet link (iframe/deep link) | — | No in-app video infra for MVP |

**No ML/CV/audio libraries are included in this spec.** (MediaPipe, TensorFlow Lite, etc. are explicitly Phase 2 — see `prd.md` §5.)

---

## 3. Repository Structure

```
StrokeApp-GEMASTIK/
├── client/                        # React Native (Expo) patient app
│   ├── App.js
│   ├── screens/
│   │   ├── ExerciseSelect.js
│   │   ├── ExerciseSession.js
│   │   └── ProgressDashboard.js
│   ├── components/
│   │   ├── GyroSensor.js
│   │   ├── ROMChart.js
│   │   └── SessionCard.js
│   ├── api/
│   │   └── client.js
│   ├── utils/
│   │   ├── gyroProcessing.js
│   │   ├── storage.js
│   │   └── constants.js
│   ├── i18n.js
│   └── assets/
├── therapist-dashboard/           # React (Vite) therapist web app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── PatientList.jsx
│   │   │   └── PatientDetail.jsx
│   │   ├── components/
│   │   │   ├── ROMTrendChart.jsx
│   │   │   ├── SessionLog.jsx
│   │   │   └── WeeklyNoteEditor.jsx
│   │   ├── api/
│   │   │   └── therapistAPI.js
│   │   └── App.jsx
│   └── vite.config.js
├── server/                        # Node/Express backend
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   └── therapist.js
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Therapist.js
│   │   ├── Session.js
│   │   └── TherapistNote.js
│   ├── controllers/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   └── .env.example
├── prd.md
├── tech-spec.md
├── implementation_plan.md
├── app-flow.md
├── design-brief.md
├── rules.md
└── README.md
```

---

## 4. Database Schema (MongoDB / Mongoose)

### 4.1 `Patient`
```javascript
{
  _id: ObjectId,
  name: String,               // required
  email: String,               // required, unique
  phone: String,
  passwordHash: String,        // required
  diagnosis: String,           // e.g. "Right hemisphere, 6 months post-stroke"
  assignedTherapistId: ObjectId, // ref: Therapist, nullable
  language: String,            // 'id' | 'en', default 'id'
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 `Therapist`
```javascript
{
  _id: ObjectId,
  name: String,                // required
  email: String,                // required, unique
  passwordHash: String,        // required
  licenseNumber: String,
  clinic: String,
  patientIds: [ObjectId],      // ref: Patient
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 `Session`
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,         // ref: Patient, required
  date: Date,                   // required
  exercise: String,             // enum: 'forearm_supination' | 'shoulder_abduction' | 'elbow_flexion'
  peakRom: Number,              // degrees
  avgRom: Number,                // degrees
  repsCompleted: Number,         // 0-10
  consistency: String,           // enum: 'low' | 'medium' | 'high'
  notes: String,                  // optional patient free text
  gyroRawSampleCount: Number,    // count only — raw array NOT stored server-side in MVP (see §7 privacy note)
  syncedAt: Date,
  createdAt: Date
}
```

### 4.4 `TherapistNote`
```javascript
{
  _id: ObjectId,
  therapistId: ObjectId,       // ref: Therapist, required
  patientId: ObjectId,          // ref: Patient, required
  weekNumber: Number,            // 1-8 relative to program start
  note: String,                   // required
  createdAt: Date
}
```

**Indexes:**
- `Session`: compound index on `{ patientId: 1, date: -1 }` for fast history queries
- `Patient`, `Therapist`: unique index on `email`

---

## 5. API Specification

Base URL: `/api`

### 5.1 Auth
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register-patient` | none | `{ name, email, password, phone? }` | `{ token, patient }` |
| POST | `/auth/login` | none | `{ email, password }` | `{ token, role: 'patient' }` |
| POST | `/auth/login-therapist` | none | `{ email, password }` | `{ token, role: 'therapist' }` |

### 5.2 Patient-facing (requires patient JWT)
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/patient/me` | — | `{ patient }` |
| POST | `/patient/sessions` | `Session` fields (minus `_id`, `patientId`) | `{ session }` |
| GET | `/patient/sessions?limit=8` | — | `{ sessions: [Session] }` |
| PATCH | `/patient/sessions/:sessionId` | `{ notes }` | `{ session }` |

### 5.3 Therapist-facing (requires therapist JWT)
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/therapist/patients` | — | `{ patients: [{ _id, name, lastSessionDate, trend }] }` |
| GET | `/therapist/patients/:patientId` | — | `{ patient, sessions: [Session], notes: [TherapistNote] }` |
| PATCH | `/therapist/patients/:patientId/notes` | `{ weekNumber, note }` | `{ note: TherapistNote }` |

### 5.4 Health check
| Method | Path | Response |
|---|---|---|
| GET | `/health` | `{ status: 'OK', time }` |

**Auth header convention:** `Authorization: Bearer <JWT>` on all protected routes. `authMiddleware.js` validates and attaches `req.user = { id, role }`.

**Error format (consistent across all endpoints):**
```json
{ "error": true, "message": "Human-readable message", "code": "OPTIONAL_ERROR_CODE" }
```

---

## 6. Core Algorithm: ROM Calculation (no ML)

Input: array of gyroscope Z-axis readings sampled at 10Hz during a session.

```javascript
// utils/gyroProcessing.js
function calculateROM(gyroZReadings, samplingIntervalSec = 0.1) {
  let angle = 0;
  const angleTrace = [];

  for (const z of gyroZReadings) {
    const deltaDeg = z * samplingIntervalSec * (180 / Math.PI);
    angle += deltaDeg;
    angleTrace.push(Math.abs(angle));
  }

  const peakRom = Math.max(...angleTrace);
  const avgRom = angleTrace.reduce((a, b) => a + b, 0) / angleTrace.length;
  const consistency = calculateConsistency(angleTrace);

  return { peakRom: round1(peakRom), avgRom: round1(avgRom), consistency };
}

function calculateConsistency(angleTrace) {
  // Detect rep peaks, compare variance across peaks
  // MVP simplification: stddev of top-10 local maxima vs mean
  // 'high' if stddev < 10% of mean, 'medium' if <25%, else 'low'
  // (Implementation detail left to build step; documented here as the spec)
}

function round1(n) { return Math.round(n * 10) / 10; }

module.exports = { calculateROM };
```

This is pure numerical integration — **no trained model, no external ML dependency.** Raw gyro arrays are processed on-device; only the computed summary (`peakRom`, `avgRom`, `consistency`, `repsCompleted`) is sent to the server (see §7).

---

## 7. Privacy & Data Handling (MVP-level, not full compliance)

- Raw gyroscope time-series arrays stay **on-device only** in MVP; only aggregated metrics (`peakRom`, `avgRom`, `consistency`) sync to the server. This reduces payload size and avoids storing granular biometric time-series remotely before a proper data-retention policy exists.
- Passwords are hashed with `bcryptjs` (min. 10 salt rounds) — never stored or logged in plaintext.
- `.env` files (containing `MONGO_URI`, `JWT_SECRET`) are **never committed** — see `.gitignore` requirement in `rules.md`.
- No production PII (real patient names/emails) is used in development or testing — use clearly-fake seed data.
- This is explicitly **not** a HIPAA/GDPR-compliant system in MVP form. Encryption-at-rest, audit logging, and formal consent flows are Phase 3 concerns once clinical piloting requires them — noted here so the AI agent does not silently add compliance theater that isn't backed by an actual policy.

---

## 8. Environment Configuration

`server/.env.example`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/strokeapp
JWT_SECRET=replace-with-strong-random-secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:19006
```

`client/` uses a plain constant (not `.env`, since Expo managed workflow env handling adds complexity not needed for MVP):
```javascript
// utils/constants.js
export const API_URL = __DEV__
  ? 'http://<your-local-ip>:5000/api'
  : 'https://<your-deployed-backend>.onrender.com/api';
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Mobile app cold start | < 3s on a 3-year-old mid-range Android device |
| Gyroscope sampling rate | 10Hz (100ms interval) — sufficient for target ROM accuracy, low battery cost |
| API response time | < 500ms for all endpoints under pilot load (<100 concurrent users) |
| Offline tolerance | App must be fully usable (record + save sessions) with zero connectivity; sync resumes automatically on reconnect |
| Browser support (therapist dashboard) | Latest 2 versions of Chrome, Safari, Edge |
| Accessibility | Minimum tap target 44x44pt; body text minimum 14px; color contrast AA |

---

## 10. Explicit Non-Dependencies (do not install these for MVP)

To prevent an AI coding agent from "helpfully" adding scope:
- No `@tensorflow/tfjs*` packages
- No `@mediapipe/*` packages
- No camera/audio recording libraries (`expo-camera`, `expo-av` recording features)
- No push notification libraries (`expo-notifications`)
- No payment/billing SDKs
- No third-party auth providers (Firebase Auth, Auth0, Clerk) — plain JWT is sufficient for MVP

If a task seems to require one of the above, stop and flag it rather than installing — it likely belongs to a Phase 2/3 document, not this spec.

---

## 11. Related Documents
- `prd.md` — product requirements and scope
- `implementation_plan.md` — ordered build steps referencing this spec
- `app-flow.md` — screens that consume these APIs
- `rules.md` — coding constraints for the AI agent building against this spec
