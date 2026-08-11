# Rules for AI Coding Agents
## StrokeApp — Global Constraints

This file (also referenced as `AGENTS.md`) applies to any AI agent (Claude Code, Cursor, Copilot Workspace, etc.) working on this repository. Read this **before** reading `implementation_plan.md` and executing any step.

---

## 1. Document Hierarchy (read in this order, always)

1. `prd.md` — what we're building and why. If a requested feature isn't here, don't build it without asking.
2. `tech-spec.md` — the technical contract. Don't substitute libraries, add dependencies, or change the data model without updating this file first.
3. `implementation_plan.md` — the build sequence. Execute in order; don't skip ahead.
4. `app-flow.md` — exact screen/button behavior. If UI logic is ambiguous, this is the source of truth, not your judgment.
5. `design-brief.md` — visual system. Use the specified colors, spacing, and components; don't invent a new visual language.
6. `rules.md` (this file) — constraints that apply across all of the above.

If any two documents conflict, `prd.md` wins on product decisions and `tech-spec.md` wins on technical decisions. Flag the conflict rather than silently picking one.

---

## 2. Scope Discipline (most important rule)

This is an MVP for a national student competition (GEMASTIK) with a hard deadline. **Scope creep is the primary risk, not lack of features.**

- Do **not** add machine learning, computer vision, or audio processing of any kind. See `tech-spec.md` §10 for the explicit non-dependency list. If a task seems to need one of these, stop and write a note in the PR/commit message flagging it as a Phase 2 item — do not implement it.
- Do **not** add features not listed in `prd.md` §4, even if they seem like "obvious" improvements (push notifications, social features, gamification, multi-language beyond ID/EN, admin consoles). See `prd.md` §5 for the explicit out-of-scope list.
- Do **not** "polish" beyond what `design-brief.md` specifies (no dark mode, no custom animations beyond what's described, no onboarding carousels).
- If you believe something out-of-scope is actually necessary for the MVP to function, say so explicitly and explain why, rather than quietly adding it.

**When in doubt, build less, not more.** A working narrow product beats a broken broad one, especially against a competition deadline.

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
- Every network call must handle failure explicitly (try/catch or `.catch()`), matching the offline-first requirement in `tech-spec.md` §9
- Never swallow errors silently (empty `catch` blocks) — at minimum, `console.error` with context; user-facing calls need a UI-visible fallback state per `app-flow.md`

---

## 4. Git & Commit Discipline

- One logical change per commit. Don't bundle "add feature X" with "fix unrelated bug Y."
- Commit messages: `type: short description` format (`feat:`, `fix:`, `chore:`, `docs:`), matching the pattern used throughout `implementation_plan.md`.
- Never commit `.env` files, `node_modules/`, build artifacts, or any file containing real credentials/secrets. Verify `.gitignore` covers these before the first commit (see `implementation_plan.md` Step 0.2).
- Never commit real patient data, even test data that resembles a real person. Use clearly fictional names (see seed data guidance in `implementation_plan.md` Step 8.3).

---

## 5. Security & Privacy Baseline

- Passwords: always hashed via `bcryptjs`, never logged, never returned in any API response (including error messages).
- JWT secret: must come from environment variable, never hardcoded, never committed.
- Raw gyroscope time-series data stays on-device per `tech-spec.md` §7 — do not add a "send raw sensor data to server" feature without explicit sign-off, since it wasn't in the original privacy design.
- Do not add third-party analytics/tracking SDKs — not specified in `tech-spec.md` and not appropriate for a health-adjacent MVP without a privacy policy in place.

---

## 6. Testing Expectations (proportional to MVP stage)

Full automated test suites are not required for MVP given the timeline, but:
- The `calculateROM` function in `utils/gyroProcessing.js` should have at least a basic script or manual verification (per `implementation_plan.md` Step 3.1) since it's the core domain logic and hardest to eyeball-verify.
- Before marking any `implementation_plan.md` phase complete, perform the "Verify" step listed for each task manually — do not mark a step done without actually running the verification.
- Do not skip the Phase 8 end-to-end smoke test — this is the closest thing to a release gate this project has.

---

## 7. When the Agent Is Uncertain

- If a requirement in `prd.md` is ambiguous (see `prd.md` §8 Open Questions), use the stated assumption in that section rather than inventing a new one.
- If `tech-spec.md` doesn't specify something (e.g., exact retry backoff timing for sync), choose the simplest reasonable default and note the choice in a code comment — don't leave it unaddressed, but don't over-engineer it either.
- If a step in `implementation_plan.md` seems to require information not present in any of the six documents, stop and ask rather than guessing — especially for anything touching data schema changes, new dependencies, or scope boundaries.

---

## 8. Definition of "Done" for Any Individual Task

A task is not done until:
1. It matches the relevant spec in `tech-spec.md` / `app-flow.md` / `design-brief.md`
2. It passes its stated "Verify" step in `implementation_plan.md`
3. It introduces no new dependency not listed in `tech-spec.md` §2 (or the addition has been explicitly discussed and this document updated)
4. It's committed with a clear message per §4 above
5. It does not silently expand scope per §2 above

---

## 9. Related documents
- `prd.md`, `tech-spec.md`, `implementation_plan.md`, `app-flow.md`, `design-brief.md` — all referenced above as the documents this file governs.
