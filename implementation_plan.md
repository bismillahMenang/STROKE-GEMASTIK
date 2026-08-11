# Implementation Plan
## StrokeApp — MVP Build Sequence

**Companion to:** `prd.md`, `tech-spec.md`, `app-flow.md`
**Audience:** AI coding agent (e.g. Claude Code) executing this build, or a human following along

**How to use this document:** Execute steps in order. Each step has a clear deliverable and a verification action. Do not proceed to the next step until the current step's verification passes. Do not implement anything from a later phase early, even if it seems convenient — see `rules.md` for the reasoning.

---

## Phase 0 — Project scaffolding

### Step 0.1 — Repository structure
**Do:** Create the folder structure exactly as defined in `tech-spec.md` §3 (`client/`, `therapist-dashboard/`, `server/`, plus the six doc files at root).
**Verify:** `tree -L 2` (or equivalent) matches the structure in `tech-spec.md`.

### Step 0.2 — Git setup
**Do:** `git init`, create `.gitignore` covering `node_modules/`, `.env`, `.expo/`, `dist/`, `build/`. Initial commit.
**Verify:** `git status` is clean after commit; `.env` files are not tracked.

### Step 0.3 — Backend skeleton
**Do:** `npm init` in `server/`, install dependencies listed in `tech-spec.md` §2 (backend row). Create minimal `server.js` with a `/api/health` route only.
**Verify:** `node server.js` starts without error; `GET /api/health` returns `{ status: 'OK', time }`.

### Step 0.4 — Mobile app skeleton
**Do:** `npx create-expo-app@latest client --template blank`, install `expo-sensors`, `axios`, `@react-native-async-storage/async-storage`, `@react-navigation/native`, `@react-navigation/bottom-tabs`.
**Verify:** `expo start` launches; app loads on a physical device via Expo Go showing the default screen.

### Step 0.5 — Web dashboard skeleton
**Do:** `npm create vite@latest therapist-dashboard -- --template react`, install `axios`, `recharts`, `react-router-dom`.
**Verify:** `npm run dev` serves the default Vite page at `http://localhost:5173`.

**Phase 0 exit criteria:** All three apps boot independently with zero custom features. Commit as `chore: scaffold client, therapist-dashboard, server`.

---

## Phase 1 — Backend data layer

### Step 1.1 — Mongoose models
**Do:** Implement `Patient.js`, `Therapist.js`, `Session.js`, `TherapistNote.js` in `server/models/` exactly matching schemas in `tech-spec.md` §4. Connect to MongoDB Atlas via `MONGO_URI` from `.env`.
**Verify:** A one-off script inserts and reads back one document per model successfully.

### Step 1.2 — Auth routes
**Do:** Implement `POST /auth/register-patient`, `POST /auth/login`, `POST /auth/login-therapist` per `tech-spec.md` §5.1. Hash passwords with `bcryptjs`. Issue JWTs signed with `JWT_SECRET`.
**Verify:** Register a test patient via curl/Postman, log in, receive a valid JWT. Decode the JWT and confirm it contains `{ id, role }`.

### Step 1.3 — Auth middleware
**Do:** Implement `middleware/authMiddleware.js` that validates the `Authorization: Bearer` header and attaches `req.user`.
**Verify:** A protected test route returns 401 without a token, and 200 with a valid token.

**Phase 1 exit criteria:** Can register/login a patient and a therapist via API calls alone (no UI yet). Commit as `feat: auth + data models`.

---

## Phase 2 — Backend session & therapist APIs

### Step 2.1 — Session endpoints
**Do:** Implement `POST /patient/sessions`, `GET /patient/sessions`, `PATCH /patient/sessions/:sessionId` per `tech-spec.md` §5.2. Require patient JWT.
**Verify:** Create 3 sessions via curl for a test patient; `GET` returns them ordered by date descending.

### Step 2.2 — Therapist patient-list endpoint
**Do:** Implement `GET /therapist/patients`. Compute `trend` (↑/→/↓) by comparing the most recent session's `peakRom` to the average of the prior 2 sessions for the same exercise.
**Verify:** With seeded session data, the trend field returns the expected direction for at least 2 test cases (one improving, one plateauing).

### Step 2.3 — Therapist patient-detail + notes endpoints
**Do:** Implement `GET /therapist/patients/:patientId` and `PATCH /therapist/patients/:patientId/notes` per `tech-spec.md` §5.3.
**Verify:** Add a note via curl, confirm it appears in the detail response.

**Phase 2 exit criteria:** Full API surface from `tech-spec.md` §5 is implemented and manually testable via curl/Postman. Commit as `feat: session and therapist APIs`.

---

## Phase 3 — Mobile: core ROM tracking (no ML)

### Step 3.1 — Gyroscope capture utility
**Do:** Implement `utils/gyroProcessing.js` per `tech-spec.md` §6 (`calculateROM`, `calculateConsistency`). Write it as a pure function, independent of React, so it can be unit-tested.
**Verify:** Feed a synthetic array of gyro readings (e.g. a sine-wave pattern simulating 3 reps) and confirm `peakRom` falls in a sane range (manually reason through the math, or write a quick test script).

### Step 3.2 — Gyroscope hookup + single exercise screen
**Do:** Build `screens/ExerciseSession.js` for exactly one exercise (`forearm_supination`) using `expo-sensors` Gyroscope, feeding readings into `calculateROM` on stop.
**Verify:** On a physical device, twist your wrist while recording; confirm a plausible ROM value (roughly 40–90°) displays after stopping.

### Step 3.3 — Local session storage
**Do:** Implement `utils/storage.js` (`saveSession`, `getSessions`, `clearSessions`) using AsyncStorage, per the earlier code pattern. Wire `ExerciseSession.js` to save on stop.
**Verify:** Record a session, force-close the app, reopen — session is still retrievable via `getSessions()`.

### Step 3.4 — Exercise selection screen
**Do:** Build `screens/ExerciseSelect.js` listing all 3 exercises from `utils/constants.js` (name, description, target ROM). Selecting one navigates to `ExerciseSession.js` configured for that exercise.
**Verify:** All 3 exercises are selectable and each correctly labels its session/output.

### Step 3.5 — Extend `ExerciseSession.js` to all 3 exercises
**Do:** Generalize the screen to accept an `exercise` prop rather than being hardcoded to forearm supination.
**Verify:** Complete one recorded session for each of the 3 exercises; each saves with the correct `exercise` field.

**Phase 3 exit criteria:** A user can pick any of 3 exercises, complete a guided session, see a ROM result, and have it persist locally. No network calls yet. Commit as `feat: gyroscope ROM tracking for 3 exercises`.

---

## Phase 4 — Mobile: progress view + navigation

### Step 4.1 — Progress dashboard screen
**Do:** Build `screens/ProgressDashboard.js` showing this week's session count and a list of the last 8 sessions (date, exercise, peak ROM, notes), reading from local storage.
**Verify:** After completing several sessions in Phase 3, they appear correctly listed here.

### Step 4.2 — ROM trend chart
**Do:** Add `components/ROMChart.js` using `react-native-chart-kit`, plotting peak ROM over the last 8 sessions for a given exercise.
**Verify:** Chart renders without crashing on a device with 8 seeded sessions; axis labels are legible.

### Step 4.3 — Bottom tab navigation
**Do:** Wire `App.js` with `@react-navigation/bottom-tabs`: "Exercises" tab → `ExerciseSelect`, "Progress" tab → `ProgressDashboard`.
**Verify:** Both tabs are reachable and state (e.g. selected exercise) doesn't leak incorrectly between them.

**Phase 4 exit criteria:** Full local-only patient app loop works: select exercise → record → view progress. Commit as `feat: progress dashboard + navigation`.

---

## Phase 5 — Mobile ↔ Backend integration

### Step 5.1 — API client
**Do:** Implement `api/client.js` (axios instance pointed at `API_URL` from `tech-spec.md` §8) with `uploadSession`, `fetchSessions`, `registerPatient`, `login` functions.
**Verify:** From the running Expo app, call `uploadSession` with test data against the local backend; confirm it appears in MongoDB.

### Step 5.2 — Auth flow (minimal, register/login screens)
**Do:** Build a lightweight registration/login screen shown before the tab navigator if no stored JWT exists. Store JWT in AsyncStorage on success.
**Verify:** Fresh install → register → land on Exercises tab. Kill and reopen app → still logged in (JWT persisted).

### Step 5.3 — Sync on session save
**Do:** After `saveSession()` succeeds locally, attempt `uploadSession()`. On failure (offline), mark session as `pending` locally and retry on next app foreground or successful network call.
**Verify:** Turn on airplane mode, record a session (succeeds locally), turn off airplane mode, reopen app — session syncs and `pending` flag clears.

**Phase 5 exit criteria:** Patient app is fully connected to the backend with offline-safe sync. Commit as `feat: mobile-backend sync with offline support`.

---

## Phase 6 — Therapist web dashboard

### Step 6.1 — Login page
**Do:** Build `pages/Login.jsx` calling `POST /auth/login-therapist`, storing JWT (e.g. in memory + localStorage for session persistence).
**Verify:** Valid therapist credentials (seeded in Phase 1) log in successfully; invalid credentials show an error.

### Step 6.2 — Patient list page
**Do:** Build `pages/PatientList.jsx` calling `GET /therapist/patients`, rendering name, last session date, and trend indicator.
**Verify:** With seeded data for ≥2 patients, both appear with correct trend arrows.

### Step 6.3 — Patient detail page
**Do:** Build `pages/PatientDetail.jsx` calling `GET /therapist/patients/:patientId`, rendering an ROM trend chart (`recharts`) and session log table.
**Verify:** Clicking a patient from the list navigates here and shows their real session history.

### Step 6.4 — Weekly note editor
**Do:** Add a note input + submit button calling `PATCH /therapist/patients/:patientId/notes`. Display existing notes chronologically.
**Verify:** Submitting a note persists it and it reappears on page reload.

### Step 6.5 — Video call entry point
**Do:** Add a "Start video call" button on the patient detail page that opens a static Zoom/Meet link (stored per-therapist or hardcoded for pilot) in a new tab.
**Verify:** Button opens the link correctly; no in-app video infrastructure is built (per `tech-spec.md` §2).

**Phase 6 exit criteria:** A therapist can log in, see their patients, review real ROM data, and leave notes. Commit as `feat: therapist dashboard core flows`.

---

## Phase 7 — Localization

### Step 7.1 — i18n utility
**Do:** Implement `client/i18n.js` and an equivalent for `therapist-dashboard/` per the pattern in `tech-spec.md`/prior code. Cover all patient- and therapist-facing strings.
**Verify:** Switching the `language` constant/state between `'id'` and `'en'` changes all visible text with no missing keys (no raw key names leaking into UI).

**Phase 7 exit criteria:** 100% of UI strings are localized, defaulting to Bahasa Indonesia. Commit as `feat: bahasa indonesia localization`.

---

## Phase 8 — Polish & pilot readiness

### Step 8.1 — Error handling pass
**Do:** Add user-facing error states for: network failure, sensor unavailable, empty session history, invalid login.
**Verify:** Manually trigger each condition (airplane mode, wrong password, fresh account with zero sessions) and confirm no crashes and no blank screens.

### Step 8.2 — Accessibility pass
**Do:** Audit against `tech-spec.md` §9 (tap targets ≥44x44pt, body text ≥14px, AA contrast). Adjust `design-brief.md`-defined styles where failing.
**Verify:** Manual check on device with a real user's finger, not just cursor clicks.

### Step 8.3 — Seed data + manuals
**Do:** Write a `server/seed.js` script creating 1 test therapist + 3 test patients with realistic session history for demos. Write 1-page patient and therapist manuals (Bahasa Indonesia).
**Verify:** Running `node seed.js` against a clean database produces a working demo-ready state.

### Step 8.4 — End-to-end smoke test
**Do:** Full manual walkthrough: register patient → complete 3 exercise sessions → confirm sync → log in as therapist → view patient → leave note → patient reopens app and sees no crash.
**Verify:** Walkthrough completes with zero errors on both a physical Android and iOS device (or documented as tested on whichever is available).

**Phase 8 exit criteria = MVP release criteria in `prd.md` §7.** Commit as `chore: MVP pilot-ready polish`.

---

## Explicit non-steps (do not do these in this plan)

- Do not add camera or audio capture at any phase — see `tech-spec.md` §10.
- Do not add push notifications.
- Do not add BPJS/payment integration.
- Do not add a multi-therapist admin console.
- If a step seems to require one of the above to "feel complete," stop and note it as a Phase 2/3 item rather than implementing it — see `rules.md`.

---

## Related documents
- `prd.md` — why these features and not others
- `tech-spec.md` — exact technical contracts each step must satisfy
- `app-flow.md` — screen transitions each mobile/web step must implement
- `design-brief.md` — visual system to apply during UI steps
- `rules.md` — global constraints while executing this plan
