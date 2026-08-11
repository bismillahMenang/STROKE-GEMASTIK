# Roadmap: Phase 2 & Phase 3
## What comes after the MVP

**Companion to:** `prd.md` (§5 Out of Scope references this document for "when")
**Status:** Planning only — do NOT build any of this until MVP (Phase 0–8 in `implementation_plan.md`) is complete and pilot-validated.

---

## Gate: MVP must clear before Phase 2 starts

Do not start Phase 2 until:
- [ ] MVP release criteria in `prd.md` §7 are met
- [ ] Pilot with ≥15 patients + ≥1 therapist has run for ≥4 weeks
- [ ] ROM accuracy validated at ≥75% agreement with therapist goniometer
- [ ] You have therapist + patient feedback in hand (not just internal opinion)

Building Phase 2 features before this gate is exactly the scope creep `rules.md` warns against.

---

## Phase 2 (post-MVP, ~6–8 weeks): Multi-modal detection

**Goal:** Add the two signal types that were deliberately deferred — camera and audio — now backed by real pilot data showing gyroscope-only isn't sufficient on its own.

### 2.1 Camera — facial asymmetry detection
- Library: MediaPipe Face Landmarker (on-device, free, pre-trained)
- Feature: during a short guided "smile/say ahh" check, capture face landmarks, compute a symmetry score (distance of left vs right landmark pairs from midline)
- Output: asymmetry score (0–1), shown to therapist as a supplementary signal — **not** a diagnosis
- New dependency: `@mediapipe/tasks-vision` or equivalent RN wrapper
- Validation needed: test against ≥20 patients with known asymmetry status; target ≥75% agreement with clinical visual assessment

### 2.2 Audio — speech clarity check
- Library: TensorFlow Lite audio model (pre-trained where possible, e.g. adapted from open speech datasets)
- Feature: 10-second recording of a standard phrase, extract MFCC features, output a clarity/dysarthria-risk score
- New dependency: `expo-av` (recording) + `tfjs-react-native` or a lightweight on-device inference approach
- Privacy note: audio is more sensitive than gyroscope data — needs an explicit consent screen before Phase 2 audio features ship (update `tech-spec.md` §7 privacy section when this lands)

### 2.3 Expanded exercise library
- Add 3–5 more exercises (wrist flexion, finger extension, resistance-band variants) based on therapist feedback from MVP pilot on what patients actually need next as they progress

### 2.4 Therapist dashboard enhancements
- Session flagging that persists server-side (MVP only had this as a UI-only toggle per `app-flow.md` §2.3 note)
- Simple templated note options alongside free text (speeds up therapist workflow)

**Exit criteria for Phase 2:** Multi-modal detection validated in a second pilot; therapist dashboard reflects richer data without becoming harder to scan quickly.

---

## Phase 3 (post-Phase 2, ~8–12 weeks): Scale & institutional integration

**Goal:** Move from "validated prototype" to "something a hospital can actually adopt at scale."

### 3.1 BPJS / insurance integration
- Research and implement whatever the 2023 telemedicine reimbursement decree requires for tele-rehab session billing
- Requires legal/compliance review — not a pure engineering task

### 3.2 Regulatory positioning
- Formal clarification with Kementerian Kesehatan on whether the app needs medical device registration (likely stays "educational/triage aid" per `prd.md` §6, but confirm formally at this scale)
- Draft a real privacy policy + consent flow (MVP explicitly skipped this per `tech-spec.md` §7 — this is where it gets addressed properly)

### 3.3 Real-time feedback
- "Raise your arm higher" style live coaching during exercises, using the camera/audio signals validated in Phase 2
- This is the most technically demanding addition — likely needs on-device model optimization for latency

### 3.4 Multi-therapist / clinic administration
- Admin console for a clinic to manage multiple therapists and bulk-assign patients
- Only build this once you have ≥2 clinics wanting to onboard simultaneously — don't build ahead of actual demand

### 3.5 Push notifications & adherence nudges
- Gentle reminders ("Yuk lanjutkan latihan hari ini" per `design-brief.md` §7 tone guidance)
- A/B test whether this actually improves adherence before assuming it's worth the added complexity

### 3.6 Prescription/program management
- Therapist can assign a structured 8-week program (which exercises, what frequency, what ROM targets) rather than patients doing exercises ad hoc

**Exit criteria for Phase 3:** At least 1 hospital or clinic network running the app as part of standard post-discharge care, with BPJS billing working end-to-end.

---

## What stays constant across all phases

- Bahasa Indonesia first
- Therapist positioned as "assisted by," never "replaced by," the app
- No feature ships without a validation step against real clinical data — this project's credibility (and GEMASTIK score) depends on evidence, not just working code
- Scope discipline per `rules.md` — each phase gets its own gate before the next begins

---

## Related documents
- `prd.md` — MVP scope this roadmap extends
- `tech-spec.md` — technical foundation Phase 2/3 builds on
- `rules.md` — scope discipline that governs when to actually start each phase
