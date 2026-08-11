# Design Brief
## StrokeApp — Visual & UX System

**Companion to:** `prd.md`, `app-flow.md`

---

## 1. Design Principles

Given the target users (persona "Budi" — post-stroke, possibly one-handed use, low-to-moderate tech literacy, possibly age 45–70 with reduced fine motor control), the interface must prioritize:

1. **Large, forgiving touch targets** — patients may have tremor or reduced dexterity, especially in the affected hand
2. **High contrast, simple layouts** — no dense information, one primary action per screen
3. **Calm, encouraging tone** — recovery is slow and frustrating; the UI should never feel clinical, cold, or judgmental
4. **Bahasa Indonesia first** — all copy written natively in Indonesian, not translated literally from English
5. **Therapist dashboard is information-dense but scannable** — therapists review many patients quickly; prioritize glanceable status over decoration

---

## 2. Color Palette

### Patient app (warm, encouraging, calm — inspired by PulihGo's teal/orange precedent which the target audience may already recognize from GEMASTIK context)

| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary | Teal | `#0F9E75` | Primary buttons, active states, brand accents |
| Primary dark | Deep teal | `#085041` | Pressed states, headers |
| Secondary / accent | Warm orange | `#D85A30` | Call-to-action highlights, "start exercise" button, encouragement badges |
| Success | Green | `#639922` | Positive trend, "improving" indicator |
| Warning | Amber | `#BA7517` | Plateau/at-risk indicator, gentle alerts |
| Danger | Red | `#A32D2D` | Declining trend, error states — use sparingly, never as a primary UI color (avoid feeling alarming) |
| Background | Off-white | `#F7F6F2` | Screen background |
| Surface | White | `#FFFFFF` | Cards |
| Text primary | Near-black | `#2C2C2A` | Headings, body |
| Text secondary | Warm gray | `#5F5E5A` | Captions, metadata |
| Border | Light gray | `#D3D1C7` | Card borders, dividers |

### Therapist dashboard (calmer, more neutral/professional — same base palette, less saturation, more whitespace)

| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary | Blue | `#185FA5` | Primary buttons, links, active nav |
| Success | Green | `#3B6D11` | ↑ trend |
| Neutral | Gray | `#5F5E5A` | → trend |
| Danger | Red | `#993D1D` (muted, not alarm-red) | ↓ trend, flagged items |
| Background | Off-white | `#F1EFE8` | Page background |
| Surface | White | `#FFFFFF` | Cards, table rows |
| Text primary | Near-black | `#2C2C2A` | — |
| Text secondary | Gray | `#888780` | — |

**Rule:** Never use red/danger color as a background fill for large areas — reserve it for small indicators (dots, small text, thin left-borders) so the app never feels alarming to a recovering patient.

---

## 3. Typography

| Context | Font | Weight | Size |
|---|---|---|---|
| Patient app — screen titles | System default (San Francisco / Roboto) | 600 (semibold) | 22–24px |
| Patient app — body/instructions | System default | 400 (regular) | 16–17px (larger than typical — accessibility) |
| Patient app — button labels | System default | 600 | 16px |
| Patient app — large numeric readouts (ROM values, rep counter) | System default | 700 (bold) | 32–40px |
| Therapist dashboard — page titles | System default | 500 | 20px |
| Therapist dashboard — body/table text | System default | 400 | 14px |
| Therapist dashboard — chart labels | System default | 400 | 12px |

**Do not go below 14px anywhere.** Patient-facing minimum is 16px per accessibility target in `tech-spec.md` §9.

**Line height:** 1.5–1.6 for body text throughout, for readability.

---

## 4. Spacing & Layout

- Base spacing unit: 8px. Use multiples (8, 16, 24, 32) for padding/margins.
- Patient app screens: 16px horizontal padding minimum, cards have 16px internal padding, 12px gap between stacked cards.
- Touch targets: minimum 44×44pt (iOS HIG standard), buttons should have at least 48px height on patient-facing screens for extra forgiveness.
- Therapist dashboard: standard web spacing, 24px page padding, 16px card padding, table rows 48px min height for scanability.
- Corner radius: 8px for buttons and inputs, 12px for cards — consistent rounding conveys the calm, approachable tone (avoid sharp corners which feel clinical).

---

## 5. Core Components

### 5.1 Primary Button (patient app)
- Full-width or near-full-width, 48–52px height
- Background: Primary teal (`#0F9E75`) for constructive actions ("Mulai", "Simpan")
- Background: Warm orange (`#D85A30`) reserved for the single most important CTA per screen (e.g., "Start exercise" on the exercise select card)
- Text: white, 16px, semibold, centered
- Disabled state: 40% opacity, no shadow

### 5.2 Exercise Card (ExerciseSelect screen)
- White surface, 12px radius, subtle border (`#D3D1C7`)
- Left accent bar, 4px wide, colored per exercise category (can reuse teal for all 3 in MVP — no need for per-exercise color coding)
- Content: exercise name (18px semibold), one-line description (14px secondary), target ROM badge (small pill, top-right)
- Entire card is tappable, with a subtle press-state (slight scale-down or opacity change)

### 5.3 ROM Gauge (during recording)
- Circular arc gauge, 0°–180°, filling clockwise as angle increases
- Center: large numeric readout of current angle (32px bold)
- Color transitions: gray (0–40% of target) → teal (40–90%) → orange glow (90%+, "almost there")
- Must update smoothly at the gyroscope's sampling rate without visible jank — this is the highest-attention component in the whole app during active use

### 5.4 Rep Counter
- Simple "X / 10" text, 20px semibold, positioned near the gauge
- Optional subtle animation (small bounce) on each rep increment for positive reinforcement

### 5.5 Progress Chart (both patient and therapist views)
- Line chart, single series per exercise
- X-axis: session date (or week number), Y-axis: ROM in degrees
- Line color: teal (patient app) / blue (therapist dashboard)
- Include a subtle horizontal dashed reference line at the exercise's target ROM
- Data points shown as small filled circles; tapping/hovering shows exact value + date in a tooltip
- Empty state (0–1 sessions): friendly illustration + text "Mulai latihan pertama untuk melihat progres" (Start your first exercise to see progress)

### 5.6 Session List Item
- Compact row: date (left), exercise name + peak ROM (middle), small note icon if a note exists (right)
- Tapping expands to show full note text inline (accordion, not navigation)

### 5.7 Trend Indicator (therapist dashboard)
- Small colored arrow + label: "↑ 12°" (green), "→ 3°" (gray), "↓ 5°" (muted red)
- Always paired with a text status label ("On-track" / "At-risk") — never rely on color alone (accessibility)

### 5.8 Toast/Snackbar (confirmation messages)
- Bottom-anchored, auto-dismiss after 2.5s
- Success: teal background, white text, checkmark icon — "Tersimpan"
- Offline-save: amber background — "Tersimpan, akan disinkron nanti"
- Error: muted red background — "Gagal menyimpan, coba lagi"

---

## 6. Illustration & Imagery

- Exercise instruction visuals: simple line-art or flat illustrations showing correct phone placement on the arm (not photographs — avoid implying a specific body type/gender/age, keep universally relatable)
- No stock photography of "sad patients" or overly clinical hospital imagery — tone should be hopeful, not somber
- Icons: use a single consistent icon set throughout (outline style, 2px stroke weight) — do not mix icon families
- Empty states and encouragement moments can use a simple friendly mascot/character if time allows (optional, not MVP-blocking) — keep neutral and non-childish for an adult 45–70 audience (avoid the overly cartoonish kangaroo-mascot tone used in some reference decks; that register fits a younger consumer app, not this clinical-adjacent context)

---

## 7. Tone of Voice (Bahasa Indonesia copy)

- Encouraging, never clinical or cold: "Bagus, terus lanjutkan!" not "Latihan selesai."
- Never guilt-trip missed sessions: "Yuk lanjutkan latihan hari ini" not "Anda belum berlatih 3 hari."
- Therapist-facing copy can be more neutral/professional in tone, since the audience is a clinician, but should still avoid jargon overload — this is a lightweight tool, not an EMR.
- Always use "Anda" (formal you) for patient-facing copy — respectful default for an older demographic.

---

## 8. Platform-Specific Notes

### Mobile (Expo/React Native)
- Respect system font-scaling (accessibility text size) where feasible — do not hardcode pixel-perfect layouts that break under larger system font settings
- Support both light backgrounds only for MVP (dark mode is out of scope — do not build a dark theme, it adds QA surface area without clinical benefit for this use case)
- Test primary flows one-handed — patient may only have full function in one arm

### Web (therapist dashboard)
- Responsive down to tablet width (768px) is sufficient for MVP — desktop-first design is acceptable since therapists will primarily use this at a workstation
- No need for mobile-web optimization of the therapist dashboard in MVP

---

## 9. What NOT to Design (explicitly out of scope)

- No dark mode
- No onboarding tutorial/walkthrough screens beyond the Auth screen (keep first-run simple; instructions live inline on the exercise screens themselves)
- No gamification systems (badges, streaks, leaderboards) — avoid infantilizing a serious medical recovery process; encouragement should come from real progress data, not points
- No custom illustrated mascot required for MVP (optional stretch only, see §6)
- No animated onboarding/marketing screens

---

## 10. Related documents
- `prd.md` — feature set these designs must support
- `app-flow.md` — screens and states this brief applies visual treatment to
- `tech-spec.md` §9 — accessibility and non-functional constraints that bound these design decisions
