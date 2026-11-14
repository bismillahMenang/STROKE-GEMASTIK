# App Flow
## RehabTrack — Screen Navigation and User Journeys

**Companion to:** `../product/prd.md`, `tech-spec.md`
**Last updated:** 2026-11-14

---

## 1. Patient App (Mobile) — Screen Map

```
[App Launch]
     |
     v
[Has valid JWT in AsyncStorage?] --NO--> [Auth Screen] --success--> (store JWT)
     |YES
     v
[Has completed onboarding?] --NO--> [Onboarding Screen] --done--> (store flag)
     |YES
     v
[Tab Navigator]
     |
     +--> [Tab: Latihan] --> [ExerciseSelect] --tap exercise--> [ExerciseSession]
     |                                                        |
     |                                                        +--> [Summary] --save--> back to Latihan
     |
     +--> [Tab: Progres] --> [ProgressDashboard] --"Hubungi terapis"--> [external Meet/Zoom link]
     |
     +--> [Tab: Catatan] --> [TherapistNotesScreen]
     |
     +--> [hidden: GyroTest] (long-press brand on Progres)
```

The bottom tab bar shows three visible tabs: **Latihan**, **Progres**, and **Catatan**. ExerciseSession, onboarding replay, and GyroTest are registered as hidden routes.

### 1.1 Auth Screen

**Purpose:** Register or log in a patient. One screen with a toggle between login and register.

**Elements:**
- App logo, brand, and short value proposition
- Toggle: "Masuk" | "Daftar"
- Register fields: name, email, phone (optional), password
- Login fields: email, password
- Primary button: "Masuk" or "Daftar"
- Inline error area

**Button logic:**
- **Masuk** -> `POST /auth/login` -> store JWT and patient object in AsyncStorage -> onboarding check -> tab navigator.
- **Daftar** -> `POST /auth/register-patient` -> store JWT and patient -> onboarding check -> tab navigator. Password must be at least 8 characters. Email is normalized to lowercase.
- **Toggle** -> clears fields and errors, switches mode.
- If the session expires during background sync, the app clears the token and returns to Auth with a session-expired message.

---

### 1.2 Onboarding Screen

**Purpose:** Explain the product and safety rules once after the first successful login.

**Elements:**
- Three slides: purpose, calibration, and "pain means stop"
- Dot indicator
- Button: "Lanjut" / "Mulai berlatih"

**Button logic:**
- **Lanjut** -> next slide.
- **Mulai berlatih** -> store `@rehabtrack/onboarded` and show the tab navigator.
- Onboarding can be replayed from the Progress header (`?` button).

---

### 1.3 ExerciseSelect (Tab: "Latihan")

**Purpose:** Let the patient choose an exercise.

**Current exercises:**
The list comes from `client/utils/constants.js` and contains six exercises. The three original MVP exercises are forearm supination, shoulder abduction, and elbow flexion. The additional exercises are wrist flexion, finger extension, and resistance band row. Targets for the additional exercises are provisional and require clinical validation.

**Elements:**
- Header card with app badge, greeting, and "Pilih latihan"
- Info strip about daily practice
- One card per exercise with icon, name, description, target ROM, and "Mulai"

**Button logic:**
- **Card tapped** -> `navigation.navigate('ExerciseSession', { exercise })`.

---

### 1.4 ExerciseSession

**Purpose:** Guide the patient through calibration, recording, and a session summary.

**Sub-states within one screen:**

1. **Instructions**
   - Exercise name and instruction text
   - Prescription row: target ROM, safe ceiling, target reps
   - Prescription source label: server, cache, or default
   - Safety note: stop if there is pain
   - Button: "Mulai Kalibrasi"

2. **Calibration (10 seconds)**
   - Countdown ring
   - "Tahan ponsel dalam posisi diam selama kalibrasi"
   - Button: "Batal" -> back to ExerciseSelect
   - Auto-advances to Recording at zero

3. **Recording**
   - Live angle gauge and progress track toward target ROM
   - Rep counter: current / target reps
   - Target reached sound plays once per session
   - Ceiling warning banner and looping warning tone while above the safe ceiling
   - Button: "Selesai"
   - Auto-stops at target reps or after 3 minutes
   - Android back button asks for confirmation before discarding
   - Rep detection uses 45 percent of target ROM to enter a rep and 18 percent to count it
   - Per-rep audio cue is not implemented yet; current audio is target and ceiling feedback only

4. **Summary**
   - Peak ROM, average ROM, reps, consistency, smoothness, ceiling hits
   - Pain selector is required before saving: "Tanpa nyeri", "Nyeri ringan", "Berhenti karena nyeri"
   - Optional note input
   - Button: "Simpan Sesi" -> save locally first, then upload if a token exists
   - Button: "Ulangi latihan" -> discard the summary and return to Instructions

**Save behavior:**
- Local save always succeeds before any network call.
- If upload succeeds, mark the session as synced and show "Tersimpan".
- If upload fails, keep the session as pending and show "Tersimpan, akan disinkron nanti".
- Pending sessions are retried when the app becomes active and on the next authenticated app session.

---

### 1.5 ProgressDashboard (Tab: "Progres")

**Purpose:** Show adherence, daily metrics, ROM trends, and a path to the therapist.

**Elements:**
- Header with brand, tutorial replay (`?`), and theme toggle
- Pending sync count when there are unsynced sessions
- Streak banner: current streak, best streak, practiced-today status
- Selected-day status card
- Weekly calendar with activity dots
- "Lihat progres saya" expandable section:
  - ROM peak and smoothness rings for the selected exercise
  - Coach insight based on pain, smoothness, and ROM
  - Effort indicator
  - All-time stats: total sessions, total reps, best ROM
  - Session logs for the selected day
- ROM trend chart with exercise selector
- Last 8 sessions with expandable details
- "Hubungi Terapis" button

**Button logic:**
- **Day tapped** -> selects that day; future days are disabled.
- **Exercise selector changed** -> re-filters the trend chart and daily metric rings locally.
- **Session row tapped** -> expands inline details, including notes and ceiling hits.
- **Hubungi Terapis** -> opens `EXPO_PUBLIC_THERAPIST_CALL_URL`. If unset, shows a configuration error.
- **Long-press brand** -> opens GyroTest.

---

### 1.6 TherapistNotesScreen (Tab: "Catatan")

**Purpose:** Let the patient read weekly notes written by the therapist.

**Elements:**
- Title: "Catatan Terapis"
- Subtitle explaining weekly guidance
- Pull-to-refresh
- Loading state
- Error state with "Coba lagi"
- Empty state
- Note cards: week number, date, therapist name, note text, template badge when present

**Button logic:**
- Screen loads `GET /patient/notes?limit=8` on focus.
- Pull-to-refresh reloads the list.
- Notes are scoped to the authenticated patient by the server.

---

### 1.7 GyroTest (hidden developer screen)

**Purpose:** Inspect the raw gyroscope stream and integrated angle on a device.

**Elements:**
- Raw X, Y, Z angular velocity
- Integrated angle
- Sample count
- "Setel ulang (tare)" button
- Sensor error text

**Access:** Long-press the RehabTrack brand on the Progress tab.

---

## 2. Therapist Web Dashboard — Screen Map

```
[App Load]
     |
     v
[Has valid JWT in localStorage?] --NO--> [Login Page]
     |YES
     v
[PatientList] --tap patient--> [PatientDetail]
     |                              |
     |                              +-- review session --> PATCH review status
     |                              +-- add weekly note --> PATCH notes
     |                              +-- video call --> external Meet/Zoom link
     |
     +-- logout --> [Login Page]
```

### 2.1 Login Page

**Elements:** Email, password, "Masuk ke Dashboard" button, error text, branding panel.

**Button logic:**
- **Masuk** -> `POST /auth/login-therapist` -> store JWT in localStorage -> `/patients`.
- Invalid credentials show an inline error.

---

### 2.2 PatientList

**Purpose:** Therapist home view for triage.

**Elements:**
- Header: "Pasien Saya" and logout
- At-risk alert when one or more patients have a declining trend
- Patient table: name, last session date, ROM trend, status
- Empty state

**Button logic:**
- **Row tapped** -> `/patients/:patientId`.
- **Logout** -> clear token and return to Login.
- A 401 response clears the token and redirects to Login.

---

### 2.3 PatientDetail

**Purpose:** Clinical review of one patient.

**Elements:**
- Header: patient name, diagnosis, phone and WhatsApp link, video call button
- Quick stats: total sessions, total reps, last ROM, number of therapist notes
- ROM trend chart with exercise selector
- Session log with date, exercise, peak ROM, reps, pain badge, patient note, and review actions
- Weekly notes list and editor
- Video call button uses `VITE_THERAPIST_CALL_URL`

**Button logic:**
- **Review good / attention** -> `PATCH /therapist/patients/:patientId/sessions/:sessionId/review` with `reviewStatus`. The status is persisted on the session.
- **Add note** -> `PATCH /therapist/patients/:patientId/notes` with `{ weekNumber, note, templateKey? }`. On success, prepend the note.
- **Video call** -> opens `VITE_THERAPIST_CALL_URL` in a new tab. If unset, shows a configuration alert.
- **Exercise selector changed** -> filters the chart client-side.
- **Back** -> `/patients`.

**Prescription editor:** `PUT /therapist/patients/:patientId/prescription` is the server contract. The dashboard editor and chart integration are implemented as part of the prescription feature.

---

## 3. Cross-Cutting Navigation Rules

- **No deep linking required for MVP.** Mobile navigation starts from the tab bar. Web navigation starts from the patient list.
- **JWT expiry:** the dashboard clears the token and redirects on 401. The mobile app clears the token when background sync receives 401. Other mobile API errors show an inline error state.
- **Offline navigation:** all mobile screens remain navigable offline. Only sync and external links depend on connectivity.
- **Android back during Recording:** show "Batalkan sesi ini?" with "Lanjutkan" and "Batalkan".
- **Theme:** light and dark palettes are provided by `ThemeContext`. The patient app follows the selected theme on all screens that use theme colors.

---

## 4. User Journey Narratives

### Journey A — First-time patient, happy path

1. Opens app -> Auth Screen in register mode.
2. Fills name, email, and password -> Daftar -> onboarding.
3. Reads three slides -> "Mulai berlatih" -> Latihan tab.
4. Taps an exercise -> reads instructions and prescription -> "Mulai Kalibrasi".
5. Holds phone still for 10 seconds.
6. Performs repetitions; hears target reached sound and sees the rep counter.
7. Recording auto-stops at target reps -> Summary.
8. Selects pain level, adds an optional note, taps "Simpan Sesi".
9. Session saves locally and uploads -> back to Latihan.
10. Opens Progres -> sees streak, daily metrics, and the session in the trend chart.
11. Opens Catatan -> sees any weekly note from the therapist.

### Journey B — Returning patient, offline

1. Opens app with a valid JWT -> Latihan tab.
2. Phone is in airplane mode.
3. Completes a session -> saves locally -> "Tersimpan, akan disinkron nanti".
4. Connectivity returns -> pending session syncs when the app becomes active.
5. Pending count disappears from Progres.

### Journey C — Therapist weekly review

1. Logs in -> PatientList shows patients and one declining trend.
2. Opens PatientDetail.
3. Reviews the 8-session chart and session log, including pain badges and notes.
4. Marks a session as "good" or "attention". The status persists.
5. Adds a weekly note. The note becomes visible in the patient's Catatan tab.
6. Starts a video call through the configured Meet/Zoom link.
7. Returns to PatientList.

---

## 5. Related Documents

- `../product/prd.md` — product scope
- `tech-spec.md` — API contracts and data model
- `design-brief.md` — visual system
- `implementation_plan.md` — build sequence
- `roadmap-phase2-3.md` — future scope
