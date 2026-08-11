# App Flow
## StrokeApp — Screen Navigation & User Journeys

**Companion to:** `prd.md`, `tech-spec.md`

---

## 1. Patient App (Mobile) — Screen Map

```
[App Launch]
     |
     v
[Has valid JWT in AsyncStorage?] --NO--> [Auth Screen] --success--> (store JWT)
     |YES                                       |
     v                                          v
[Tab Navigator] <----------------------------------
     |
     +--> [Tab: Exercises] --> [ExerciseSelect] --tap exercise--> [ExerciseSession] --stop--> [SessionSummary] --continue--> back to [ExerciseSelect]
     |
     +--> [Tab: Progress] --> [ProgressDashboard] --tap "Call therapist"--> [external Zoom/Meet link opens]
```

### 1.1 Auth Screen
**Purpose:** Register or log in a patient. Single screen with a toggle between "Login" and "Register" modes.

**Elements:**
- App logo + name
- Toggle: "Login" | "Daftar" (Register)
- Fields (Register mode): Name, Email, Phone (optional), Password
- Fields (Login mode): Email, Password
- Primary button: "Masuk" (Login) / "Daftar" (Register)
- Error text area (shown on failure)

**Button logic:**
- **Login tapped** → `POST /auth/login` → on success, store JWT + patient object in AsyncStorage, navigate to Tab Navigator → Exercises tab. On failure, show inline error ("Email atau password salah").
- **Register tapped** → `POST /auth/register-patient` → on success, auto-login (store JWT), navigate to Tab Navigator → Exercises tab. On failure (e.g. email exists), show inline error.
- **Toggle mode tapped** → clears fields and error state, switches form.

---

### 1.2 ExerciseSelect (Tab: "Latihan" / Exercises)
**Purpose:** Let the patient choose which of the 3 exercises to do today.

**Elements:**
- Header: "Pilih latihan"
- 3 cards, one per exercise, each showing: name, one-line instruction, target ROM, small illustrative image
- Tapping a card navigates to ExerciseSession with that exercise's config

**Button logic:**
- **Card tapped** → `navigation.navigate('ExerciseSession', { exercise })`. No confirmation step — selecting is the same as starting the flow toward recording.

---

### 1.3 ExerciseSession
**Purpose:** Guide the patient through calibration, guided reps, and produce a ROM result.

**Sub-states within this single screen (managed via local state, not separate navigation stack entries):**

1. **Instructions state**
   - Shows exercise name, animated/illustrated correct phone placement, target ROM
   - Button: "Mulai" (Start) → moves to Calibration state

2. **Calibration state (10s)**
   - Text: "Tahan ponsel diam..." (Hold phone still)
   - 10-second countdown; auto-advances to Recording state when countdown hits 0
   - No user action required (auto-advance); a "Batal" (Cancel) text link returns to ExerciseSelect

3. **Recording state**
   - Live angle gauge (0–180°, updates in real time from gyroscope)
   - Rep counter: "3 / 10"
   - Audio beep fires each time a rep threshold is detected
   - Button: "Selesai" (Stop) → moves to Summary state (also auto-advances at 10 reps or a 3-minute timeout, whichever comes first)

4. **Summary state**
   - Displays: Peak ROM, Average ROM, Reps completed, Consistency label
   - Optional text input: "Catatan (opsional)" — patient can add a note
   - Button: "Simpan" (Save) → calls `saveSession()` (local) then attempts `uploadSession()` (remote); shows a brief toast ("Tersimpan" / "Tersimpan, akan disinkron nanti" if offline) → navigates back to ExerciseSelect
   - Button: "Ulangi" (Redo) → discards this session's data, returns to Instructions state for the same exercise

**Button logic summary:**
- **Mulai** → Instructions → Calibration
- **Batal** (during calibration) → back to ExerciseSelect, discard nothing (nothing recorded yet)
- **Selesai** (during recording) → Recording → Summary; runs `calculateROM()` on the buffered gyro readings
- **Simpan** → persist session, sync attempt, navigate to ExerciseSelect
- **Ulangi** → discard summary, back to Instructions for same exercise

---

### 1.4 ProgressDashboard (Tab: "Progres" / Progress)
**Purpose:** Show the patient their history and a path to their therapist.

**Elements:**
- Stat card: "Sesi minggu ini" (Sessions this week) with count
- ROM trend chart (defaults to most-recently-used exercise; a small selector lets the patient switch which exercise's trend to view)
- List: last 8 sessions (date, exercise, peak ROM, note preview)
- Button: "Hubungi terapis" (Contact therapist) → opens the external Zoom/Meet link in the device browser

**Button logic:**
- **Exercise selector changed** → re-renders chart with that exercise's session subset (client-side filter, no new API call needed if sessions are already fetched)
- **Hubungi terapis tapped** → `Linking.openURL(therapistCallLink)`
- **Session list item tapped** → expands inline to show full note text (no navigation)

---

## 2. Therapist Web Dashboard — Screen Map

```
[App Load]
     |
     v
[Has valid JWT in localStorage?] --NO--> [Login Page]
     |YES                                    |
     v                                       | success
[PatientList] <----------------------------
     |
     +--tap patient--> [PatientDetail] --"Start video call"--> [external Zoom/Meet, new tab]
     |                       |
     |                       +--"Add note"--> (inline form, stays on same page)
     |
     +--"Logout"--> [Login Page]
```

### 2.1 Login Page
**Elements:** Email field, password field, "Masuk" button, error text.

**Button logic:**
- **Masuk tapped** → `POST /auth/login-therapist` → on success, store JWT, redirect to `/patients` (PatientList). On failure, show inline error.

---

### 2.2 PatientList
**Purpose:** Therapist's home view — who needs attention.

**Elements:**
- Header: "Pasien Saya" (My Patients) + logout link/button
- Table/list of patients: Name | Last session date | Trend indicator (↑ green / → gray / ↓ red) | Status label ("On-track" / "At-risk")
- Empty state: "Belum ada pasien" if list is empty

**Button logic:**
- **Row tapped** → `navigate(/patients/:patientId)` → PatientDetail
- **Logout tapped** → clear JWT from localStorage, redirect to Login Page

---

### 2.3 PatientDetail
**Purpose:** Deep-dive on one patient's progress; where clinical review happens.

**Elements:**
- Header card: Patient name, diagnosis text, contact info (phone/WhatsApp link)
- ROM trend chart (`recharts`), same 8-week view as patient sees, with an exercise selector
- Session log table: Date | Exercise | Peak ROM | Reps | Patient note (if any)
  - Each row has two quick-action icons: "✓ Progress baik" (mark reviewed/good) and "⚠ Perlu perhatian" (flag for follow-up) — these are simple boolean tags stored client-side or as a lightweight field on the session for MVP (see `tech-spec.md` for whether this is persisted; if not specified, treat as a Phase 2 nice-to-have and skip persistence, show as UI-only toggle)
- Weekly notes section: chronological list of past `TherapistNote` entries + a text input to add a new one, labeled with the current week number
- Button: "Mulai video call" (Start video call) — prominent, top of page

**Button logic:**
- **Mulai video call tapped** → opens the stored/hardcoded Zoom or Meet URL in a new browser tab
- **Add note, then submit tapped** → `PATCH /therapist/patients/:patientId/notes` with `{ weekNumber, note }` → on success, prepend to the notes list and clear the input
- **Exercise selector changed** → re-filter chart data client-side (sessions already loaded in the page's initial fetch)
- **Back / breadcrumb tapped** → `navigate(/patients)`

---

## 3. Cross-Cutting Navigation Rules

- **No deep linking required for MVP** — all navigation starts from the tab bar (mobile) or the patient list (web).
- **JWT expiry handling:** if any API call returns 401, both apps should clear the stored token and redirect to their respective auth screen, showing a message: "Sesi berakhir, silakan masuk kembali" (Session expired, please log in again).
- **Offline navigation (mobile only):** all screens except the initial Auth Screen must remain navigable offline. Only actions that require the network (sync, video call link) should show a network-dependent state; navigation itself never blocks on connectivity.
- **Back button behavior (mobile):** hardware back button on Android during the Recording state of ExerciseSession should prompt "Batalkan sesi ini?" (Cancel this session?) rather than silently discarding an in-progress recording.

---

## 4. User Journey Narratives (for reference during QA)

### Journey A — First-time patient, happy path
1. Opens app for the first time → Auth Screen (Register mode)
2. Fills name/email/password → taps Daftar → lands on Exercises tab
3. Taps "Rotasi Lengan Bawah" (Forearm Supination) card
4. Reads instructions, taps Mulai
5. Holds phone still for 10s calibration
6. Rotates wrist 10 times, hears beeps, watches counter go 1→10
7. Recording auto-stops at 10 reps → Summary shows Peak ROM 62°
8. Adds note "lumayan capek" (fairly tired), taps Simpan
9. Toast: "Tersimpan" → back on Exercises tab
10. Switches to Progress tab → sees 1 session in the list, chart shows a single point

### Journey B — Returning patient, offline
1. Opens app (already logged in, JWT valid) → lands on Exercises tab
2. Phone is in airplane mode
3. Completes a shoulder abduction session → Simpan → toast: "Tersimpan, akan disinkron nanti"
4. Later, connectivity returns (app in foreground or reopened) → pending session syncs silently, sync indicator clears

### Journey C — Therapist weekly review
1. Logs in → PatientList shows 5 patients, one with a ↓ trend flagged "At-risk"
2. Taps that patient → PatientDetail
3. Reviews the 8-week chart — sees a plateau starting week 5
4. Scans session log, notices patient's note "sakit di bahu" (shoulder pain) on 2 recent sessions
5. Taps "Mulai video call" → talks to patient live (outside the app)
6. Returns to PatientDetail, adds note: "Nyeri bahu, kurangi target ROM minggu ini, evaluasi ulang minggu depan"
7. Submits note → returns to PatientList to review the next patient

---

## 5. Related documents
- `prd.md` — why these screens exist and what's intentionally absent
- `tech-spec.md` — API calls referenced in button logic above
- `design-brief.md` — visual treatment of each screen and component
- `implementation_plan.md` — build order that produces these screens
