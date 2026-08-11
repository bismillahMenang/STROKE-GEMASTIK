# Product Requirements Document (PRD)
## StrokeApp — Home Stroke Rehabilitation Monitor

**Version:** 1.0 (MVP)
**Status:** Draft for development
**Owner:** [Your name]
**Last updated:** [Date]

---

## 1. Problem Statement

Stroke is the leading cause of death in Indonesia (15.4% of all deaths; ~642,943 new cases/year). Survivors are typically discharged home after acute care with limited access to ongoing physiotherapy — Indonesia has only ~40 stroke units and a nationwide shortage of ~26,000 physiotherapists. Rehabilitation costs Rp500,000–1,000,000 per in-clinic session, and total rehab costs can reach Rp50–100 million without insurance.

The critical 6–12 month recovery window is when formal therapy access disappears, but home exercises go unsupervised, unmeasured, and unmotivated — causing functional gains to plateau prematurely, even though repetitive task training (RTT) is clinically proven to improve arm function when done consistently (Cochrane, French et al. 2016).

**Core problem:** There is no affordable, Bahasa-Indonesia, hardware-free tool that lets stroke survivors do home exercises with objective progress tracking, while keeping a physiotherapist in the loop asynchronously.

---

## 2. Goals

### Primary goal (MVP)
Enable a stroke survivor to perform 3 standardized arm-rehab exercises at home using only their smartphone, have range-of-motion (ROM) objectively measured via the phone's gyroscope, and have a physiotherapist review progress weekly without requiring an in-person visit.

### Success metrics (MVP pilot, 20 patients, 8 weeks)
- ≥75% agreement between app-measured ROM and therapist goniometer assessment
- ≥60% exercise adherence (patients complete ≥3 sessions/week as prescribed)
- ≥3.5/5 average patient satisfaction score
- ≥1 partner therapist actively using the dashboard weekly

### Non-goals (explicitly out of scope for MVP)
- Diagnosing stroke or any medical condition
- Replacing therapist judgment or in-person assessment
- Real-time AI coaching or form correction
- Camera-based facial asymmetry detection (Phase 2)
- Audio-based speech/dysarthria detection (Phase 2)
- BPJS/insurance claims integration (Phase 3)
- Prescription or medication management
- Multi-language support beyond Bahasa Indonesia + English

---

## 3. Target Users

### Primary persona: Patient (Budi, stroke survivor)
- Age 45–70, 3–12 months post-stroke, one-sided arm weakness
- Discharged from hospital, limited/no ongoing therapy access
- Owns a basic-to-mid-range Android or iOS smartphone
- Low-to-moderate tech literacy — needs large buttons, simple flows, Bahasa Indonesia
- Motivation: wants to see visible proof of progress; discouraged by lack of feedback

### Secondary persona: Physiotherapist (Ibu Sari, PT/OT)
- Works at a hospital rehab department or private clinic
- Manages 10–30 patients, limited time per patient
- Needs: fast weekly review (not real-time monitoring), objective data (not just patient self-report), ability to flag concerning trends
- Skeptical of "AI replacing me" — must be positioned as an assistant tool

### Tertiary persona: Caregiver (family member)
- Often helps position the phone, launches the app, encourages the patient
- May monitor progress on the patient's behalf

---

## 4. Core Features (MVP)

### 4.1 Exercise library (3 exercises, hardcoded)
| Exercise | Movement | Target ROM |
|---|---|---|
| Forearm supination/pronation | Wrist twist, phone held palm-down on forearm | 80° each direction |
| Shoulder abduction | Raise arm sideways to shoulder height | 90° |
| Elbow flexion | Bicep-curl motion, phone in palm | 150° |

Each exercise screen shows: name, short instruction text, an illustrative image/animation of correct phone placement, and a "Start" action.

### 4.2 Guided exercise session
- 10-second calibration ("hold phone still")
- 10 guided repetitions with rep counter and audio cue per rep
- Live angle readout during the session
- Post-session summary: peak ROM, average ROM, reps completed, consistency label
- Optional free-text note field ("felt pain today", etc.)

### 4.3 Patient progress dashboard
- This week's completed sessions count
- 8-week ROM trend line chart (per exercise)
- List of last 8 sessions with date, exercise, peak ROM, and notes
- Entry point to join the weekly video call with assigned therapist

### 4.4 Therapist web dashboard
- Login (email/password)
- List of assigned patients with last-session date and trend indicator (↑/→/↓)
- Patient detail page: 8-week ROM chart, session log, ability to add a weekly free-text note
- "Start video call" action (opens a Zoom/Google Meet link)

### 4.5 Data sync
- Sessions are recorded and stored locally first (offline-safe)
- Automatic background sync to the backend when connectivity is available
- Sync status indicator ("3 sessions pending sync")

### 4.6 Localization
- All patient- and therapist-facing UI text in Bahasa Indonesia (default), with English as a fallback/secondary option

---

## 5. Out of Scope — Detailed

Explicitly **not** built in MVP, to prevent scope creep:

- **Camera/CV features** (facial asymmetry detection) — requires ML model training + clinical validation lead time; deferred to Phase 2.
- **Audio features** (dysarthria/speech detection) — same reasoning; Phase 2.
- **Real-time form-correction feedback** ("raise your arm higher") — requires more advanced sensor fusion; Phase 3.
- **Spasticity or pain measurement** — outside gyroscope's measurable scope.
- **BPJS/insurance integration** — regulatory complexity; validate clinical value first.
- **Patient-to-patient social features** — not core to the therapeutic loop.
- **Appointment scheduling system** — MVP uses a simple external Zoom/Meet link; no in-app calendar.
- **Multi-therapist clinic management / admin console** — single-therapist-per-patient assignment is sufficient for pilot.
- **Push notifications** — nice-to-have reminder system, deferred unless time allows after core loop is stable.

---

## 6. Assumptions & Constraints

- Smartphone gyroscope sampling at ~10Hz is sufficient to estimate ROM within ±5–8° accuracy for the 3 target exercises (validated against PulihGo precedent and biomechanics literature).
- Patients have access to Wi-Fi or mobile data at least once every few days for sync (app must work fully offline between syncs).
- Therapist has a stable internet connection and a modern browser (Chrome/Safari/Edge, last 2 versions) for the web dashboard.
- Video calls are handled by third-party tools (Zoom/Google Meet); no in-app video call infrastructure is built.
- This is positioned as an **educational/monitoring aid**, not a certified medical device — no diagnostic claims are made in-app.

---

## 7. Release Criteria (Definition of Done for MVP)

- [ ] All 3 exercises functional end-to-end on a physical iOS and Android device
- [ ] Sessions persist offline and sync correctly when connectivity returns
- [ ] Therapist can log in, view at least 1 real patient's data, and leave a note
- [ ] Bahasa Indonesia strings cover 100% of patient- and therapist-facing UI
- [ ] No ML/camera/audio dependencies present in the codebase (kept out per scope)
- [ ] Pilot-ready: can be handed to 1 therapist + up to 20 patients without developer intervention

---

## 8. Open Questions

- Does the assigned-therapist relationship need to be many-to-one, or can a patient have multiple therapists? (Assume one for MVP.)
- What happens if a patient has bilateral (both-sided) weakness? (Assume unilateral for MVP; note as a known limitation.)
- Should session notes be visible to the patient in real time, or only after therapist review? (Assume visible immediately; therapist notes are separate and always visible.)

---

## 9. Related Documents
- `tech-spec.md` — technical architecture and data model
- `implementation_plan.md` — build sequence
- `app-flow.md` — screen-by-screen navigation
- `design-brief.md` — visual design system
- `rules.md` — AI agent coding constraints
