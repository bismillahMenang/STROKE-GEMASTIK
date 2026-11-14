# Rules for AI Coding Agents
## StrokeApp — Global Constraints

This file (also referenced as `AGENTS.md`) applies to any AI agent (Claude Code, Cursor, Copilot Workspace, etc.) working on this repository. Read this **before** reading `engineering/implementation_plan.md` and executing any MVP or Phase 2 step.

---

## 1. Document Hierarchy (read in this order, always)

1. `product/prd.md` — what we're building and why. If a requested feature isn't here, don't build it without asking.
2. `engineering/tech-spec.md` — the technical contract. Don't substitute libraries, add dependencies, or change the data model without updating this file first.
3. `engineering/roadmap-phase2-3.md` — the authorized roadmap Phase 2 (multi-modal) and Phase 3 scope. Roadmap Phase 2 is approved to start without an entry gate.
4. `engineering/implementation_plan.md` — the MVP build sequence. Execute MVP steps in order; roadmap Phase 2 work follows the roadmap.
5. `engineering/app-flow.md` — exact screen/button behavior. If UI logic is ambiguous, this is the source of truth, not your judgment.
6. `engineering/design-brief.md` — visual system. Use the specified colors, spacing, and components; don't invent a new visual language.
7. `engineering/rules.md` (this file) — constraints that apply across all of the above.

If any two documents conflict, `product/prd.md` wins on product decisions and `engineering/tech-spec.md` wins on technical decisions. Flag the conflict rather than silently picking one.

---

## 2. Scope Discipline (most important rule)

The MVP remains a narrow deliverable for a national student competition (GEMASTIK) with a hard deadline. **Unapproved scope is the primary risk, not lack of features.**

- MVP work (Phases 0–8 in `engineering/implementation_plan.md`) must remain gyroscope-first and must not add ML, computer vision, or audio capture.
- Roadmap Phase 2 is explicitly approved to start immediately. Camera, audio, and on-device ML/CV are in scope for roadmap Phase 2 and may use the dependencies approved in `engineering/tech-spec.md` §2.1. There is no MVP release, pilot, accuracy, feedback, or other entry gate for roadmap Phase 2.
- For MVP, do **not** add features not listed in `product/prd.md` §4, even if they seem like "obvious" improvements (push notifications, social features, gamification, multi-language beyond ID/EN, admin consoles). For Phase 2, implement only capabilities explicitly authorized in `product/prd.md` and `engineering/roadmap-phase2-3.md`.
- Do **not** add Phase 3 capabilities while implementing roadmap Phase 2 unless they are explicitly moved into the active scope in the roadmap.
- Do **not** "polish" beyond what `engineering/design-brief.md` specifies (no dark mode, no custom animations beyond what's described, no onboarding carousels).
- If you believe something out-of-scope is actually necessary for the MVP to function, say so explicitly and explain why, rather than quietly adding it.

**When in doubt, build the smallest approved slice.** A working focused product beats a broken broad one, especially against a competition deadline.

---

## 3. Code Style & Structure

### General
- JavaScript/JSX throughout (no TypeScript conversion for MVP — adds friction without proportional benefit at this scale/timeline; can be a Phase 2 consideration, not now)
- Functional components + hooks only (React and React Native) — no class components
- Prefer named exports over default exports for utility functions; default exports are fine for React components (one component per file)
- No unnecessary abstraction — don't build a generic "form builder" or "config-driven UI system" for 3 hardcoded exercises. Write direct, readable code appropriate to the MVP's actual size.

### File length
- Soft limit: 200 lines per file. If a component file exceeds this, extract sub-components or move logic into a `utils/` function.
- Hard limit: 400 lines. A file this long must be split before merging — flag it rather than let it grow further.

### Naming
- Components: `PascalCase.js` (or `.jsx` in the web dashboard)
- Utilities/hooks: `camelCase.js`
- Constants: `SCREAMING_SNAKE_CASE` for actual constant values, `camelCase` for constant objects/config
- API routes: kebab-case paths (`/register-patient`, not `/registerPatient`)

### Comments
- Comment *why*, not *what* — don't narrate obvious code
- Every function in `utils/gyroProcessing.js` needs a comment explaining the math/reasoning, since this is the one place with non-obvious domain logic (signal integration)
- No commented-out dead code left in commits — delete it (git history preserves it if needed later)

### Error handling
- Every network call must handle failure explicitly (try/catch or `.catch()`), matching the offline-first requirement in `engineering/tech-spec.md` §9
- Never swallow errors silently (empty `catch` blocks) — at minimum, `console.error` with context; user-facing calls need a UI-visible fallback state per `engineering/app-flow.md`

---

## 4. Git & Commit Discipline

- One logical change per commit. Don't bundle "add feature X" with "fix unrelated bug Y."
- Commit messages: `type: short description` format (`feat:`, `fix:`, `chore:`, `docs:`), matching the pattern used throughout `engineering/implementation_plan.md`.
- Never commit `.env` files, `node_modules/`, build artifacts, or any file containing real credentials/secrets. Verify `.gitignore` covers these before the first commit (see `engineering/implementation_plan.md` Step 0.2).
- Never commit real patient data, even test data that resembles a real person. Use clearly fictional names (see seed data guidance in `engineering/implementation_plan.md` Step 8.3).

---

## 5. Security & Privacy Baseline

- Passwords: always hashed via `bcryptjs`, never logged, never returned in any API response (including error messages).
- JWT secret: must come from environment variable, never hardcoded, never committed.
- Raw gyroscope time-series data stays on-device per `engineering/tech-spec.md` §7 — do not add a "send raw sensor data to server" feature without explicit sign-off, since it wasn't in the original privacy design.
- Roadmap Phase 2 camera frames and audio recordings are processed on-device and are not uploaded or retained by default. Audio capture requires explicit user consent before recording; derived metrics only may be synced unless `engineering/tech-spec.md` is updated.
- Do not add third-party analytics/tracking SDKs — not specified in `engineering/tech-spec.md` and not appropriate for a health-adjacent MVP without a privacy policy in place.

---

## 6. Testing Expectations (proportional to MVP stage)

Full automated test suites are not required for MVP given the timeline, but:
- The `calculateROM` function in `utils/gyroProcessing.js` should have at least a basic script or manual verification (per `engineering/implementation_plan.md` Step 3.1) since it's the core domain logic and hardest to eyeball-verify.
- Before marking any `engineering/implementation_plan.md` phase complete, perform the "Verify" step listed for each task manually — do not mark a step done without actually running the verification.
- Do not skip the Phase 8 end-to-end smoke test — it remains the MVP readiness check, but it is not a prerequisite for starting roadmap Phase 2.

---

## 7. When the Agent Is Uncertain

- If a requirement in `product/prd.md` is ambiguous (see `product/prd.md` §8 Open Questions), use the stated assumption in that section rather than inventing a new one.
- If `engineering/tech-spec.md` doesn't specify something (e.g., exact retry backoff timing for sync), choose the simplest reasonable default and note the choice in a code comment — don't leave it unaddressed, but don't over-engineer it either.
- If a step requires a dependency outside the approved stack in `engineering/tech-spec.md` §2 or §2.1, update the technical contract before installing it. Dependencies already approved in §2.1 may be used directly; no additional roadmap Phase 2 entry approval is required.

---

## 8. Definition of "Done" for Any Individual Task

A task is not done until:
1. It matches the relevant spec in `engineering/tech-spec.md` / `engineering/app-flow.md` / `engineering/design-brief.md`
2. It passes its stated "Verify" step in `engineering/implementation_plan.md`
3. It introduces no dependency outside the lists in `engineering/tech-spec.md` §2 and §2.1 (or the technical contract has been updated before installation)
4. It's committed with a clear message per §4 above
5. It does not silently expand scope per §2 above

---

## 9. Related documents
- `product/prd.md`, `engineering/tech-spec.md`, `engineering/roadmap-phase2-3.md`, `engineering/implementation_plan.md`, `engineering/app-flow.md`, `engineering/design-brief.md` — all referenced above as the documents this file governs.
