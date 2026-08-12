# Technical Specification
## StrokeApp — MVP Architecture

**Version:** 1.1
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

The MVP baseline does not require ML/CV/audio libraries. Roadmap Phase 2 dependencies are explicitly approved below and may be added when their corresponding features are implemented.

### 2.1 Roadmap Phase 2 dependency authorization

Roadmap Phase 2 is approved to start without an MVP or pilot entry gate. The following dependencies are approved for roadmap Phase 2 implementation; installing one of these does not require another document-level approval.

| Capability | Approved dependency | Constraint |
|---|---|---|
| Camera capture | `expo-camera` | Use the Expo SDK 57-compatible release and request camera permission in the app flow. |
| Face landmark processing | `@mediapipe/tasks-vision` or a maintained React Native-compatible wrapper | Process frames on-device; use the wrapper when the direct package is not supported by the native runtime. |
| Audio capture | `expo-audio` | Use the Expo SDK 57-compatible release; do not start new work with `expo-av`. |
| On-device audio inference | `@tensorflow/tfjs` + `@tensorflow/tfjs-react-native` + `expo-gl`, or a smaller compatible on-device runtime | Select and benchmark the runtime during Phase 2 implementation; raw audio remains local. |

Phase 2 native face implementation uses `react-native-vision-camera-face-detector` with its required `react-native-vision-camera`, `react-native-nitro-modules`, `react-native-nitro-image`, and `react-native-worklets` peers. The wrapper provides on-device landmarks for static images captured through `expo-camera`; it is the maintained React Native-compatible alternative to the web-only MediaPipe Tasks Vision runtime.

These approvals authorize dependency use, not a claim that every runtime combination is production-ready. Compatibility and performance are verified as part of the relevant roadmap Phase 2 feature work, not as a prerequisite to starting roadmap Phase 2.

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
  exercise: String,             // enum: MVP exercises plus 'wrist_flexion' | 'finger_extension' | 'resistance_band_row' (Phase 2)
  peakRom: Number,              // degrees
  avgRom: Number,                // degrees
  repsCompleted: Number,         // 0-10
  consistency: String,           // enum: 'low' | 'medium' | 'high'
  notes: String,                  // optional patient free text
  gyroRawSampleCount: Number,    // count only — raw array NOT stored server-side in MVP (see §7 privacy note)
  syncedAt: Date,
  reviewStatus: String,           // 'unreviewed' | 'good' | 'attention', Phase 2 therapist review
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
  templateKey: String,            // optional Phase 2 note template identifier
  createdAt: Date
}
```

### 4.5 `Assessment` (roadmap Phase 2)
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,             // ref: Patient, required
  date: Date,                       // required
  type: String,                     // 'facial_asymmetry' | 'speech_clarity'
  score: Number,                    // normalized 0-1 derived metric
  risk: String,                     // 'low' | 'medium' | 'high' | 'unknown'
  modelVersion: String,             // adapter/model version used on-device
  consentedAt: Date,                // required for speech assessment
  createdAt: Date
}
```

**Indexes:**
- `Session`: compound index on `{ patientId: 1, date: -1 }` for fast history queries
- `Patient`, `Therapist`: unique index on `email`
- `Assessment`: compound index on `{ patientId: 1, date: -1 }`

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
| POST | `/patient/assessments` | `{ date?, type, score, risk, modelVersion, consentedAt? }` | `{ assessment }` |
| GET | `/patient/assessments?limit=8` | — | `{ assessments: [Assessment] }` |

### 5.3 Therapist-facing (requires therapist JWT)
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/therapist/patients` | — | `{ patients: [{ _id, name, lastSessionDate, trend }] }` |
| GET | `/therapist/patients/:patientId` | — | `{ patient, sessions: [Session], notes: [TherapistNote], assessments: [Assessment] }` |
| PATCH | `/therapist/patients/:patientId/notes` | `{ weekNumber, note, templateKey? }` | `{ note: TherapistNote }` |
| PATCH | `/therapist/patients/:patientId/sessions/:sessionId/review` | `{ reviewStatus }` | `{ session }` |

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

## 6. Core Algorithm: MVP ROM Calculation (no ML)

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
- Phase 2 camera and audio inputs are processed on-device. Raw frames and recordings are not uploaded or retained by default; only derived metrics may be synchronized.
- Audio capture requires explicit informed consent before recording. Camera and microphone permissions must be requested with user-facing explanations.
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

## 10. Dependency Boundaries

The following remain outside the approved MVP and Phase 2 scope:
- No push notification libraries (`expo-notifications`)
- No payment/billing SDKs
- No third-party auth providers (Firebase Auth, Auth0, Clerk) — plain JWT remains sufficient
- No raw camera or audio uploads to the server

Camera, audio, MediaPipe, and TensorFlow dependencies listed in §2.1 are approved for roadmap Phase 2. `expo-av` is not approved for new work because the current Expo SDK 57 stack provides `expo-audio` for recording and playback.

A dependency outside §2 or §2.1 requires a technical-spec update before installation. This is dependency hygiene and does not create a roadmap Phase 2 start gate.

---

## 11. Related Documents
- `prd.md` — product requirements and scope
- `implementation_plan.md` — ordered build steps referencing this spec
- `app-flow.md` — screens that consume these APIs
- `rules.md` — coding constraints for the AI agent building against this spec
