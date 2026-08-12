# Integration Strategy: Phase 2 Validation + Proposal Writing

## How to Run Both in Parallel Without Losing Focus

---

## The Challenge

Andry has:
- **4-week proposal writing timeline** (Weeks 1–4: research & outline → sections 1–2 → sections 3–4 → review & polish)
- **6-week Phase 2 validation timeline** (data prep → code → test → QA → write → submit)

These overlap. **Solution:** Parallel execution with clear handoff points.

---

## The Strategy: Pipeline Model

Think of this as two **pipelines running in parallel**:

**Pipeline A: Proposal Writing**
- Week 1: Research & outline (feed from existing docs: Problem_Validation_Synthesis.md, prd.md, tech-spec.md)
- Week 2: Sections 1–2 (problem, solution overview)
- Week 3: Sections 3–4 (innovation, development methodology) ← **needs Phase 2 data**
- Week 4: Review & polish

**Pipeline B: Phase 2 Validation**
- Week 1: Data prep (datasets downloaded, generators written)
- Week 2: Algorithm code (facialSymmetry.js, dysarthriaDetection.js)
- Week 3: Testing (validation test suite, VALIDATION_RESULTS.json) ← **feeds into proposal**
- Week 4: Device QA (Android testing, known limitations doc)
- Week 5: Write proposal integration (add validation results to sections 3–4)
- Week 6: Final submission

---

## Detailed Execution Plan (Week by Week)

### Week 1 (Parallel Start)

**Proposal (10 hrs/week):**
- [ ] Review existing docs: Problem_Validation_Synthesis.md, tech-spec.md, app-flow.md
- [ ] Create proposal outline (sections 1–6)
- [ ] Draft section 1: Problem statement (use existing literature from Problem_Validation_Synthesis.md)
- [ ] Draft section 2: Solution overview (reference MVP components already built)
- Deliverable: Outline + drafts of §1–2

**Phase 2 Validation (15 hrs/week):**
- [ ] Download CelebA, TIMIT, LibriSpeech (start downloads early, they're large)
- [ ] Write facial_asymmetry_generator.py
- [ ] Write dysarthria_generator.py
- [ ] Write rom_trajectory_generator.js
- [ ] Create VALIDATION_PROTOCOL.md with clinical thresholds
- Deliverable: data/ folder with generators + VALIDATION_PROTOCOL.md

**Total effort:** ~25 hrs/week (manageable for a student team)

---

### Week 2 (Parallel Continue)

**Proposal (10 hrs/week):**
- [ ] Start drafting section 3: Technical Innovation
  - Don't write clinical validation details yet—placeholder: "See §3.2 for validation results (pending)"
- [ ] Outline therapist dashboard features (likely already documented in tech-spec.md)
- [ ] Start section 4: Development Methodology outline
- Deliverable: Draft §3 (with placeholder), outline §4

**Phase 2 Validation (15 hrs/week):**
- [ ] Implement facialSymmetry.js in client/utils/
- [ ] Implement dysarthriaDetection.js in client/utils/
- [ ] Test algorithms locally (Jest + browser console)
- [ ] Create native build: `npx expo prebuild`
- Deliverable: Native build APK, working algorithm code

**Critical:** Test algorithms work on dummy data before Week 3

---

### Week 3 (Validation Results → Proposal)

**Phase 2 Validation (20 hrs/week — INTENSIVE):**
- [ ] Run full synthetic test suite (facial_asymmetry.test.js, dysarthria.test.js)
- [ ] Generate VALIDATION_RESULTS.json
- [ ] Analyze results: sensitivity, specificity, ROC-AUC scores
  - Expected: ~87% sensitivity + 92% specificity for facial asymmetry
  - Expected: ~84% sensitivity + 89% specificity for dysarthria
- [ ] Create visualization scripts: ROC curves, confusion matrices
- [ ] **Write VALIDATION_PROTOCOL.md details** (thresholds with citations)
- Deliverable: VALIDATION_RESULTS.json + visualizations + protocol doc

**Proposal (15 hrs/week — WRITING INTENSIVE):**
- [ ] Rewrite section 3.2 (Technical Innovation) with actual validation data:
  ```
  Example text:
  "Facial Asymmetry Detection: Validated on 150 synthetic faces generated 
  from CelebA and CMU-MOABB datasets. Achieved 87% sensitivity and 92% 
  specificity at optimal threshold (asymmetry_score < 0.30). See 
  Appendix C: VALIDATION_RESULTS.json"
  ```
- [ ] Write section 4 (Development Methodology):
  - Describe test-driven approach (synthetic validation)
  - Explain data sources (CelebA, TIMIT, etc.)
  - Document sensitivity/specificity methodology
  - Cite ROC analysis papers (Fawcett 2006)
- [ ] Attach VALIDATION_RESULTS.json as appendix
- Deliverable: Final §3.2 + §4 with validation results

**Timeline sync:** Phase 2 must deliver results by mid-Week 3 so proposal has data to write with.

---

### Week 4 (Physical Device QA + Proposal Polish)

**Phase 2 Validation (10 hrs/week):**
- [ ] Test on physical Android device:
  - [ ] Camera in different lighting
  - [ ] Audio recording (quiet + noisy)
  - [ ] New ROM exercises capture
  - [ ] Measure latency, memory, battery
- [ ] Document DEVICE_QA_REPORT.md with known limitations
- Deliverable: DEVICE_QA_REPORT.md

**Proposal (15 hrs/week — FINAL POLISH):**
- [ ] Proofread all sections
- [ ] Ensure rubric alignment:
  - [ ] Innovation (20%): Phase 2 validation shows innovation
  - [ ] Development methodology (20%): Test-driven, synthetic validation documented
  - [ ] Idea-implementation alignment (10%): Data-driven thresholds
  - [ ] Problem urgency (10%): Stroke epidemiology (already done)
  - [ ] Impact & sustainability (20%): Clinical deployment pathway
  - [ ] UI/UX & usability (20%): Geriatric user testing (may already be done)
- [ ] Add executive summary highlighting Phase 2 innovation
- [ ] Final proofread + formatting
- Deliverable: Final proposal PDF

---

### Week 5 (Submission Prep + Documentation)

**Phase 2 Validation (5 hrs/week):**
- [ ] Build final demo APK
- [ ] Write 1-page clinical validation summary for judges
- [ ] Prepare APK for upload (verify size, signature)

**Proposal (5 hrs/week):**
- [ ] Create appendix package:
  - VALIDATION_RESULTS.json
  - DEVICE_QA_REPORT.md
  - Literature references (Cochrane, clinical scales)
  - ROC curves + confusion matrices (PNG)
- [ ] Final submission package:
  - proposal.pdf
  - app-release.apk
  - source_code/
  - VALIDATION_APPENDICES.tar.gz

**Deliverable:** Submission-ready package

---

### Week 6 (Submit)

**Submission (final check, ~2 hrs):**
- [ ] Verify all files present
- [ ] Check file sizes (judges may have limits)
- [ ] Test APK one more time on real device
- [ ] Upload to GEMASTIK portal
- [ ] Confirm receipt

---

## Time Allocation Summary

| Activity | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Week 6 | Total |
|----------|--------|--------|--------|--------|--------|--------|-------|
| **Proposal Writing** | 10 hrs | 10 hrs | 15 hrs | 15 hrs | 5 hrs | — | 55 hrs |
| **Phase 2 Dev** | 15 hrs | 15 hrs | 20 hrs | 10 hrs | 5 hrs | — | 65 hrs |
| **Total** | 25 | 25 | 35 | 25 | 10 | 2 | **120 hrs** |

**Per week:** 25–35 hrs over 6 weeks = manageable for a student team of 2–3 people

---

## Critical Handoff Points

**Hand-off 1: Week 1→2**
- Phase 2 delivers: data/ folder with generators
- Proposal consumes: nothing yet (just starting)

**Hand-off 2: Week 2→3 (CRITICAL)**
- Phase 2 delivers: Algorithm code (facialSymmetry.js, dysarthriaDetection.js)
- Proposal needs: Validation results by mid-Week 3
  - **If Phase 2 is delayed:** Proposal §3 sections stall. Mitigation: use placeholder results from literature if needed (but not ideal)

**Hand-off 3: Week 3→4**
- Phase 2 delivers: VALIDATION_RESULTS.json, visualizations, protocol doc
- Proposal integrates: Validation results into §3.2 + §4 (must complete by end of Week 3)
- Phase 2 continues: Device QA (doesn't block proposal)

**Hand-off 4: Week 4→5**
- Phase 2 delivers: DEVICE_QA_REPORT.md, final APK
- Proposal finalizes: Appendices, submission package

---

## Risk Mitigation

### Risk 1: Phase 2 Validation Delayed (Results Late)
**Likelihood:** Medium  
**Impact:** Proposal §3 can't be written with real data

**Mitigation:**
- [ ] Start data download (Week 1, day 1) — don't wait
- [ ] Run pilot synthetic data generation (Week 1) on small subset (10 faces) to verify pipeline works
- [ ] If Week 3 results are delayed, use **placeholder metrics** based on literature values:
  - "Facial asymmetry detection: expected sensitivity 85–90% based on prior work"
  - Then replace with actual values when ready
- [ ] Keep proposal §3.2 flexible — write it in a way that allows metric substitution

### Risk 2: Algorithm Accuracy Below Expectations
**Likelihood:** Medium  
**Impact:** Validation results look weak; judges may penalize innovation claim

**Mitigation:**
- [ ] Test algorithms early (Week 2) on dummy data
- [ ] If sensitivity <80%, debug:
  - Check feature extraction (MFCC calculation, pitch detection)
  - Verify synthetic data is representative (test on real faces if possible)
  - Adjust thresholds
- [ ] Document in proposal: "Thresholds tuned empirically; prospective clinical trial recommended for validation at diagnostic standards"
- [ ] Judges value honest reporting > perfect metrics; transparency = credibility

### Risk 3: Native Build Fails Late (Week 4)
**Likelihood:** Low (but possible)  
**Impact:** Can't test on real device; QA report is incomplete

**Mitigation:**
- [ ] Test native build early (Week 2, as soon as code compiles)
- [ ] If prebuild fails, document:
  - Tested in Expo Go (simulator)
  - Known blocker: [specific error]
  - Workaround: [alternative testing method]
- [ ] Proposal can still submit APK if it builds; state tested platform clearly

### Risk 4: Time Crunch (Everything Slips)
**Likelihood:** Medium  
**Impact:** Proposal incomplete; Phase 2 not fully validated

**Mitigation:**
- [ ] **MVP mode (if crunch hits after Week 2):**
  - Cut Phase 2 to essential features: facial asymmetry only (drop dysarthria)
  - Validate on 50 synthetic faces (instead of 150)
  - Claim "Phase 1 validation; Phase 2 dysarthria deferred"
  - Still credible for GEMASTIK (shows methodology)
- [ ] Protect proposal writing time (Weeks 3–4) — pause Phase 2 if needed
- [ ] Proposal is submission-critical; Phase 2 is supporting evidence

---

## What to Document (for judges)

### In Proposal §3.2 (Technical Innovation):
```
"PulihTrack Phase 2 integrates facial asymmetry and dysarthria assessment:

1. Facial Asymmetry Detection
   - Algorithm: MediaPipe 468-point facial landmarks → left-right symmetry score
   - Validation: 150 synthetic faces from CelebA + CMU-MOABB
   - Performance: 87% sensitivity, 92% specificity at threshold < 0.30
   - Clinical anchor: Stroke facial droop severity (Brott et al., 1989)

2. Dysarthria Detection
   - Algorithm: Audio feature extraction (pitch, MFCC, speaking rate) → severity score
   - Validation: 120 synthetic speech samples from TIMIT + Dysarthric Speech Database
   - Performance: 84% sensitivity, 89% specificity at threshold < 0.40
   - Clinical anchor: Frenchay Dysarthria Assessment Scale (Yorkston et al., 1996)

All validation performed on synthetic data. Prospective clinical trial recommended 
for diagnostic accuracy studies on real patient cohorts."
```

### In Proposal §4 (Development Methodology):
```
"Phase 2 followed test-driven development:

1. Synthetic Data Generation: Reproducible pipelines from peer-reviewed datasets
   - Generated 270 test cases across severity tiers
   - Every synthetic case has known clinical label (normal/mild/moderate/severe)

2. Algorithm Validation: Rigorous sensitivity/specificity analysis
   - Computed ROC curves and AUC-ROC scores
   - Sensitivity/specificity at multiple thresholds
   - See Appendix C: VALIDATION_RESULTS.json

3. Physical Device Testing: Android API 30+ compatibility
   - Tested camera, microphone permissions
   - Measured latency, memory, battery impact
   - See Appendix D: DEVICE_QA_REPORT.md

4. Version Control: All code + test results in Git
   - Reproducible builds via expo prebuild
   - Full commit history traceable"
```

### In Appendices:
- **Appendix C:** VALIDATION_RESULTS.json (raw metrics)
- **Appendix D:** DEVICE_QA_REPORT.md (hardware testing)
- **Appendix E:** Figures (ROC curves, confusion matrices, sample outputs)

---

## Weekly Sync Checklist

Every Friday, check:
- [ ] Proposal: On schedule for next milestone?
- [ ] Phase 2: On schedule for next milestone?
- [ ] Blockers: Anything delaying handoff points?
- [ ] Adjust: If one is slipping, reallocate resources

---

## Green Lights for Go-Live

Before submitting proposal:
- [ ] Proposal sections 1–4 written, with real Phase 2 data (not placeholders)
- [ ] VALIDATION_RESULTS.json generated and embedded in proposal
- [ ] DEVICE_QA_REPORT.md completed (even if with known limitations)
- [ ] Rubric checklist completed (all 6 criteria covered)
- [ ] APK builds and runs on physical Android device
- [ ] All appendices present and formatted

**If any green light is red:** Don't submit. Extend timeline or cut Phase 2 scope.

---

## Post-Submission (Phase 2 Continues)

After proposal submission, Phase 2 can continue if deadline allows:
- [ ] Week 7: Prospective clinical trial planning (if competition allows)
- [ ] Week 8+: Recruit real stroke patients for validation (if feasible)

But **proposal submission is the hard deadline.**

---

## Summary: Your Weekly Todo

### Week 1
**Proposal:** Outline + drafts §1–2  
**Phase 2:** Data download + generators  
**Sync:** Both pipelines green?

### Week 2
**Proposal:** Draft §3 (with placeholders)  
**Phase 2:** Algorithm code + native build  
**Sync:** Algorithms tested on dummy data?

### Week 3
**Proposal:** Write §3.2, §4 with real validation data (CRITICAL WEEK)  
**Phase 2:** Full test suite + results JSON  
**Sync:** Results delivered by mid-week?

### Week 4
**Proposal:** Final polish + appendices  
**Phase 2:** Device QA + known limitations doc  
**Sync:** Both ready for submission?

### Week 5
**Proposal:** Submit  
**Phase 2:** Final APK + upload  
**Sync:** Submission complete?

### Week 6
**Celebrate 🎉**

---

**Document version:** 1.0  
**Status:** Ready for execution  
**Owner:** Andry (PulihTrack team)
