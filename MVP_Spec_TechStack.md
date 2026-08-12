# StrokeApp MVP — Feature Spec & Tech Stack

**Build time:** 4–6 weeks  
**Team size:** 2 developers (1 mobile, 1 backend/web)  
**Scope:** ROM tracking (gyroscope) + weekly therapist async review  
**ML required:** NO (Phase 2+, not MVP)

---

## MVP Scope: What's IN / What's OUT

### IN (Weeks 1–6)
- ✅ Gyroscope-based ROM measurement (3 exercises)
- ✅ Session logging (date, ROM values, notes)
- ✅ Patient progress chart (ROM over time, 8-week view)
- ✅ Therapist async dashboard (patient list, last 4 sessions, weekly notes)
- ✅ Patient-therapist video call link (Zoom/Google Meet integration)
- ✅ Bahasa Indonesia UI
- ✅ Cloud sync (sessions uploaded to backend)

### OUT (Phase 2/3, not MVP)
- ❌ Camera-based facial asymmetry (complex, needs ML, validation takes time)
- ❌ Audio dysarthria detection (requires speech ML model, data sensitivity concerns)
- ❌ Real-time AI feedback ("raise your arm higher")
- ❌ Spasticity measurement (needs advanced sensors)
- ❌ BPJS integration (legal/regulatory, does Phase 1 without it)
- ❌ Prescription management
- ❌ Doctor referral system
- ❌ Appointment scheduling

**Why this scope:** Gyroscope alone is sufficient for clinical validation (Cochrane: ROM is the leading indicator of functional recovery post-stroke). Simpler = faster to launch = more time for clinical testing before GEMASTIK deadline.

---

## Core Features (Detailed)

### Feature 1: Exercise Selection Screen
**User:** Patient  
**Flow:** App → "Choose today's exercise" → Select 1 of 3 exercises

**3 Exercises (hardcoded for MVP):**
1. **Forearm supination/pronation** (wrist twist)
   - Place phone on forearm (palm-down)
   - Rotate wrist left-right 10 times
   - ROM metric: peak rotation angle (degrees)
   - Target: 80° (supination) + 80° (pronation) = 160° total

2. **Shoulder abduction** (arm raise to side)
   - Hold phone in hand, arm at side
   - Raise arm sideways to shoulder height, lower
   - 10 reps
   - ROM metric: peak arm angle from body midline (degrees)
   - Target: 90° (healthy)

3. **Elbow flexion** (bicep curl)
   - Hold phone in palm, arm at side
   - Flex elbow to bring phone toward shoulder, straighten
   - 10 reps
   - ROM metric: peak elbow angle (degrees, where 0° = straight)
   - Target: 150° (healthy full flexion)

**UI:** Large image showing correct phone placement + animated stick figure demonstrating exercise → "Ready?" button → Start.

---

### Feature 2: Real-Time Exercise Session
**User:** Patient  
**During session:**

1. **Calibration (10 sec):**
   - "Hold phone still at starting position"
   - Capture gyroscope zero-state (baseline)

2. **Guided reps (1–2 min):**
   - Beep on each rep (audio feedback)
   - Counter: "1 / 10 reps"
   - Real-time gauge: Shows current angle (blue arc, 0–180°)
   - Text: "Keep going..." or "Perfect!"

3. **Post-session summary (30 sec):**
   - Show metrics:
     - Peak ROM this session (e.g., "78°")
     - Average ROM (e.g., "74°")
     - Consistency (e.g., "High — your reps were steady")
     - Reps completed (e.g., "9 / 10")
   - "Save session" button (auto-saves, optional manual note: "Pain in shoulder today")

**Data collected per session:**
```json
{
  "date": "2025-01-20",
  "exercise": "forearm_supination",
  "peak_rom": 78,
  "avg_rom": 74,
  "reps_completed": 9,
  "rep_consistency": "high",
  "notes": "slight pain",
  "duration_sec": 105,
  "gyro_raw": [/* 100+ data points */]
}
```

---

### Feature 3: Patient Progress Dashboard
**User:** Patient  
**Screen:** Home screen (after exercise selection)

**Top section:**
- **This week's progress:** "1 / 3 exercises done today"
- **8-week trend chart:**
  - X-axis: Week 1–8
  - Y-axis: ROM (0–180°)
  - Line graph: Forearm supination ROM trend (e.g., 60° → 78°)
  - Motivational text: "Improving! +18° since Week 1" (if trending up)

**Middle section:**
- **Last 4 sessions (table):**
  - Date | Exercise | Peak ROM | Notes
  - 2025-01-20 | Forearm | 78° | slight pain
  - 2025-01-18 | Forearm | 76° | —
  - 2025-01-16 | Shoulder | 88° | —
  - 2025-01-14 | Elbow | 145° | —

**Bottom section:**
- **"Review with therapist" button** → Opens Zoom/Google Meet link for this week's check-in
- **"Add notes" button** → Patient can write weekly reflections

---

### Feature 4: Therapist Dashboard (Web)
**User:** Assigned physiotherapist  
**Access:** therapist.strokeapp.local (password-protected)

**Patient list:**
- Name | Last session | Trend (↑ / → / ↓) | Status (On-track / At-risk)
- Ahmad Budiman | Jan 20 | ↑ 12° | On-track
- Siti Maryam | Jan 18 | → 3° | At-risk (plateau)
- Budi Santoso | Jan 12 | ↓ 5° | At-risk (declining)

**Clicking on a patient → Patient detail page:**

**Top card:**
- Name, age, diagnosis (e.g., "Right hemisphere, 6 months post-stroke")
- Contact: Phone + WhatsApp link

**Chart (8 weeks of sessions):**
- Same ROM trend as patient sees
- Annotations: Therapist can click dates to see notes ("pain", "traveled", "missed exercise")

**Session log:**
- Clickable cards for last 8 sessions, showing:
  - Date, exercise, ROM, reps, patient notes
  - **Therapist action buttons:**
    - "Good progress" (✓ mark)
    - "Form looks off" (flag for next video call)
    - "Plateau — adjust exercise" (replace with harder variation)

**Weekly note field:**
- Therapist types review after Zoom call:
  - "ROM improving. Patient reports less pain. Ready to progress to resistance band version."
  - Auto-timestamped, visible to patient (read-only)

**Big red button at top:** "Video call with [Patient name]" → Launches Zoom via iframe (embedded)

---

### Feature 5: Data Sync & Cloud Backend
**User:** Both (transparent)

**What syncs:**
- Every completed exercise session → uploaded to backend within 5 min of completion
- Therapist notes → synced immediately when saved
- Patient progress visible to therapist in <2 min

**Offline support:**
- Patient can do exercises offline (gyro data logged locally)
- Automatic sync when WiFi returns
- Indicator: "3 sessions pending sync" if offline

---

## Tech Stack

### Frontend: Patient Mobile App

**Framework:** React Native (Expo)

**Why Expo?**
- Fastest path to iOS + Android from one codebase
- Built-in device sensor APIs (gyroscope, camera ready for Phase 2)
- Hot reload for rapid iteration
- Needs ~4 weeks for fully functional MVP

**Key libraries:**
- `expo-sensors` → Gyroscope API
- `@react-native-camera-roll/camera-roll` → File access
- `react-native-chart-kit` → Progress charts
- `react-native-gesture-handler` → Smooth UX
- `axios` → API calls to backend
- `@react-native-async-storage/async-storage` → Offline session logging

**Folder structure:**
```
StrokeApp/
├── App.js (root, navigation)
├── screens/
│   ├── ExerciseSelect.js (feature 1)
│   ├── ExerciseSession.js (feature 2, core gyro logic)
│   ├── ProgressDashboard.js (feature 3)
│   └── VideoCall.js (feature 5)
├── components/
│   ├── GyroSensor.js (gyro data collection + processing)
│   ├── ROMChart.js (reusable chart)
│   ├── SessionCard.js (session history item)
│   └── TherapistLink.js (Zoom embed)
├── api/
│   └── client.js (axios instance, backend URLs)
├── utils/
│   ├── gyroProcessing.js (angle calculation from raw gyro)
│   ├── storage.js (AsyncStorage wrapper)
│   └── constants.js (exercise configs, ROM targets)
└── assets/
    └── images/ (exercise demo PNGs, avatars)
```

**Key algorithm (gyro processing):**
```javascript
// Simplified: gyroscope outputs angular velocity (rad/s)
// Integrate over time to get angle (degrees)

function calculateROMFromGyro(gyroDataPoints) {
  let angle = 0;
  const angles = [];
  
  // Numerical integration: angle = ∫ angular_velocity dt
  for (let i = 1; i < gyroDataPoints.length; i++) {
    const dt = 0.1; // 100ms sampling (10 Hz)
    const dAngle = gyroDataPoints[i].z * dt * (180 / Math.PI); // Convert to degrees
    angle += dAngle;
    angles.push(angle);
  }
  
  const peak = Math.max(...angles.map(Math.abs)); // Peak magnitude
  const avg = angles.reduce((a, b) => a + Math.abs(b), 0) / angles.length;
  
  return { peak, avg, consistency: calculateConsistency(angles) };
}

function calculateConsistency(angles) {
  // 10 reps = 10 peaks. If all peaks ±5° of mean, "High" consistency
  // Simplified for MVP
  return "high"; // TODO: real implementation
}
```

**No ML required.** Pure signal processing (integration, peak detection).

---

### Frontend: Therapist Web Dashboard

**Framework:** React (Create React App or Vite)

**Why React?**
- Therapist dashboard is simpler than mobile app
- Can reuse chart components
- Easier to embed Zoom iframe
- Can launch in ~2 weeks alongside mobile app

**Key libraries:**
- `recharts` → Better charts than react-native-chart-kit
- `axios` → API
- `react-router` → Page routing (patient list → patient detail)
- `react-zoom-embed` or `iframe` → Video calls
- `react-table` or manual table → Session log

**Folder structure:**
```
therapist-dashboard/
├── src/
│   ├── pages/
│   │   ├── PatientList.js (all my patients)
│   │   ├── PatientDetail.js (individual patient + chart)
│   │   └── Login.js
│   ├── components/
│   │   ├── ROMTrendChart.js
│   │   ├── SessionLog.js
│   │   ├── VideoCallEmbed.js
│   │   └── WeeklyNoteEditor.js
│   ├── api/
│   │   └── therapistAPI.js
│   └── App.js
└── package.json
```

---

### Backend: Node.js + Express

**Why Node?**
- JavaScript fullstack (same language as React/React Native)
- Fast to prototype
- Good for real-time data (WebSocket for future push notifications)
- Runs on free tier (Railway, Fly.io, Render)

**Key libraries:**
- `express` → REST API
- `mongoose` → MongoDB ODM
- `jsonwebtoken` → Auth (patient + therapist login)
- `bcryptjs` → Password hashing
- `cors` → Cross-origin requests
- `dotenv` → Environment config

**API endpoints (MVP):**
```
# Patient endpoints
POST   /api/auth/register-patient
POST   /api/auth/login
GET    /api/patient/me
POST   /api/patient/sessions (create new session)
GET    /api/patient/sessions (list my sessions, last 8)
PATCH  /api/patient/sessions/:sessionId (add notes)

# Therapist endpoints
POST   /api/auth/login-therapist
GET    /api/therapist/patients (my assigned patients)
GET    /api/therapist/patients/:patientId (patient detail + chart)
PATCH  /api/therapist/patients/:patientId/notes (weekly note)

# Admin (optional for MVP)
POST   /api/admin/assign-therapist-to-patient
```

**Database schema (MongoDB):**
```javascript
// Patient
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  passwordHash: String,
  diagnosis: String, // "Right hemisphere, 6 months post-stroke"
  assignedTherapistId: ObjectId (reference to Therapist),
  createdAt: Date
}

// Therapist
{
  _id: ObjectId,
  name: String,
  email: String,
  licenseNumber: String,
  clinic: String,
  patientIds: [ObjectId], // Array of assigned patient IDs
  createdAt: Date
}

// Session (exercise data)
{
  _id: ObjectId,
  patientId: ObjectId,
  date: Date,
  exercise: String, // "forearm_supination"
  peakRom: Number, // 78
  avgRom: Number,  // 74
  consistency: String, // "high"
  repsCompleted: Number,
  notes: String, // Optional patient note
  gyroRaw: [Number], // Raw gyroscope Z-axis values (100-200 points)
  createdAt: Date
}

// TherapistNote (weekly review)
{
  _id: ObjectId,
  therapistId: ObjectId,
  patientId: ObjectId,
  week: Number, // 1-8
  notes: String, // "ROM improving, ready to progress"
  createdAt: Date
}
```

**No database migration complexity** — MongoDB is schemaless, so you can evolve on the fly.

---

### DevOps & Hosting

**Backend hosting:** Render.com or Railway.io (free tier for MVP, auto-deploys from GitHub)

**Database:** MongoDB Atlas (free tier: 512MB, sufficient for 20 pilot patients)

**Frontend hosting:** Vercel (therapist dashboard, auto-deploys from GitHub)

**Mobile app:** Distributed via Expo Go (testing) → Google Play + App Store (after pilot, Phase 2)

**Git workflow:**
```
main branch = production (therapist dashboard live on Vercel)
develop branch = staging
feature/* branches = individual features
```

**CI/CD:** GitHub Actions (auto-test, auto-deploy on push to main)

---

## Development Timeline (4–6 weeks)

### Week 1: Setup + Core Gyro
**Deliverable:** Gyroscope working on phone, basic session save

- [ ] React Native + Expo boilerplate
- [ ] Gyroscope integration (expo-sensors)
- [ ] Session logging (AsyncStorage)
- [ ] GitHub repo initialized
- [ ] Backend skeleton (auth routes, session POST/GET)

**By end of Week 1:**
- Run app on phone → do 1 forearm exercise → see ROM value on screen → save to local storage

---

### Week 2: Multi-Exercise + Chart
**Deliverable:** All 3 exercises working, progress chart displaying

- [ ] Implement exercise 2 (shoulder) + exercise 3 (elbow)
- [ ] Add React-native-chart-kit, display 8-week trend (mock data)
- [ ] Session history list
- [ ] Backend: Connect to MongoDB, sessions API working

**By end of Week 2:**
- Do all 3 exercises on phone
- See individual session ROMs + 8-week trend chart
- Data persists in cloud

---

### Week 3: Therapist Dashboard + Zoom
**Deliverable:** Basic therapist web dashboard, video call embed

- [ ] React web app (Create React App)
- [ ] Therapist login
- [ ] Patient list + patient detail page
- [ ] ROM chart on therapist side (same data as patient)
- [ ] Zoom embed (iframe, therapist clicks "Call patient")
- [ ] Weekly note editor

**By end of Week 3:**
- Log in as therapist
- See assigned patients, click one
- See their ROM chart
- Click "Call patient" → Zoom meeting starts

---

### Week 4: Polish + Testing
**Deliverable:** MVP fully functional, ready for clinical pilot

- [ ] Bahasa Indonesia translations (UI strings)
- [ ] Error handling (network offline, sensor failure)
- [ ] Accessibility (button sizes, font sizes)
- [ ] Bug fixes from internal testing
- [ ] Therapist manual (1 page PDF)
- [ ] Patient manual (1 page PDF)

**By end of Week 4:**
- App is polished, ready to put in 5 survivors' hands
- Documentation exists for therapist + patient

---

## Feature Comparison: MVP vs Phase 2/3

| Feature | MVP | Phase 2 | Phase 3 |
|---------|-----|---------|---------|
| **Gyroscope ROM** | ✅ All 3 exercises | ✅ +5 more exercises | ✅ Resistance band variants |
| **Camera (facial asymmetry)** | ❌ | ✅ (add Phase 2) | ✅ Refined with ML |
| **Audio (dysarthria)** | ❌ | ✅ (add Phase 2) | ✅ ML-based, automatic scoring |
| **Real-time AI feedback** | ❌ | ❌ | ✅ "Raise arm higher" |
| **Therapist notes** | ✅ Simple free text | ✅ + templates | ✅ + predictive suggestions |
| **Video calls** | ✅ Zoom iframe | ✅ + recording | ✅ + transcript analysis |
| **BPJS integration** | ❌ | ❌ | ✅ Reimbursement tracking |
| **Prescription mgmt** | ❌ | ✅ | ✅ + alerts |

---

## ML: Why NOT in MVP?

**You asked: "Will this use ML?"**

**MVP:** No.  
**Phase 2 (Weeks 11–16):** Yes.  
**Phase 3 (Weeks 17–22):** Yes.

**Why not in MVP:**
1. **Gyroscope doesn't need ML.** Pure math (numerical integration) suffices.
2. **Camera ML (facial asymmetry) adds 2–3 weeks** of model training + validation. Delays MVP.
3. **Clinical validation without ML is faster.** You prove: "Gyroscope ROM = therapist goniometer" (simple correlation). Phase 2 can begin immediately, while this evidence informs feature tuning and release validation.
4. **GEMASTIK rubric doesn't require ML.** Innovation can be "novel combination of sensor + async architecture," not "novel ML model."

**When ML enters (Phase 2):**
- **Facial asymmetry detection:** MediaPipe Pose (pre-trained, free) + your custom classifier
  - Input: Patient's face video during exercise
  - Output: Asymmetry score (0–1)
  - Training: 100–200 labeled videos (stroke survivors + controls)
  - Time: 2 weeks (data collection, model training, validation)
- **Dysarthria detection:** TensorFlow Lite audio model
  - Input: 10-sec speech recording ("please count from 1 to 10")
  - Output: Dysarthria severity score
  - Pre-trained options available (CMU SPHINX, Mozilla Common Voice)
  - Time: 1 week (integration) + 2 weeks (custom model if needed)

**Recommendation:** Keep the MVP baseline free of ML, start the approved Phase 2 camera/audio work without an entry gate, and use clinical feedback to tune and validate those features.

---

## Why This Tech Stack Is "Best"

| Criterion | Choice | Why |
|-----------|--------|-----|
| **Speed to MVP** | React Native + Node | Both mature, large communities, fast prototyping |
| **Cost** | Render + MongoDB Atlas free tier | $0 to launch, scale later |
| **Maintainability** | JavaScript fullstack | One language across mobile/web/backend |
| **Offline support** | AsyncStorage (React Native) | Critical for home therapy where WiFi may be intermittent |
| **Scalability** | Node + MongoDB | No schema migrations needed, horizontal scaling easy |
| **Clinical trust** | Open-source libraries only | No proprietary black box (important for healthcare) |
| **Regulatory** | No special frameworks | Plain REST API, no HIPAA-specific DB (can add encryption later) |

---

## MVP Feature Checklist (Copy into GitHub Issues)

### Core
- [ ] Gyroscope logging for 3 exercises
- [ ] Session calculation (peak ROM, avg, consistency)
- [ ] 8-week progress chart
- [ ] Session history (last 8 sessions)
- [ ] Therapist patient list
- [ ] Therapist patient detail page with chart
- [ ] Therapist weekly notes
- [ ] Zoom video call embed
- [ ] Cloud sync (sessions uploaded to backend)
- [ ] Offline support (local storage fallback)

### Polish
- [ ] Bahasa Indonesia translations
- [ ] Error handling (network, sensor fail)
- [ ] Accessibility review (WCAG AA minimum)
- [ ] Patient manual PDF
- [ ] Therapist manual PDF
- [ ] Test on real devices (iPhone + Android)

### Testing
- [ ] 3 internal testers (developers + friends)
- [ ] 1 therapist review (does dashboard make sense?)
- [ ] 2-3 stroke survivors (UX feedback, rough accuracy check)

---

## Next Actions

**This week:**
1. **Day 1:** GitHub repo created, Expo project initialized
2. **Day 2–3:** Gyroscope hello-world running on your phone
3. **Day 4–5:** Exercise selection screen + first session recording working
4. **Day 6–7:** Push to backend, verify cloud sync

**By end of Week 1:** App on phone, sessions saving to cloud, therapist skeleton API working.

---

## Is this the best way?

**YES. For GEMASTIK + MVP speed.**

**Alternative considered:**
- Full Flutter (Dart) — smaller community, harder to find help
- React Native (bare, not Expo) — more control, slower to launch (+2 weeks)
- SwiftUI + Kotlin (native) — max performance, 3x dev time, overkill for MVP
- Django + React (Python backend) — more boilerplate, slower than Node

**Your tech stack balances: Speed + Simplicity + Scalability + Cost.**

You're building an MVP, not production infrastructure. **Iterate fast, validate, then scale.**

Go build. 🚀
