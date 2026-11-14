# Project Naming & Scope Audit
## PulihTrack (working) → Final name + MVP↔Phase2 feasibility check

> **Keputusan final (terkini):** Nama karya adalah **RehabTrack** — "RehabTrack: Sistem Monitoring Rehabilitasi Pasca-Stroke Berbasis Smartphone dengan Pelacakan Range-of-Motion Menggunakan Gyroscope dan Tele-Supervision Asinkron" (Opsi 1 di bawah). Scope implementasi aktif: Phase 1 (MVP) saja.

---

## 1. Judul Proyek (GEMASTIK-grade standard)

### Referensi format (TB Vector)
"TB Vector Sistem Cerdas Berbasis Perangkat Lunak untuk Pelacakan Spasial Batuk Tuberkulosis dengan Direction of Arrival dan Inverse Beamforming"

**Struktur:** [Nama singkat] [Kategori sistem] untuk [masalah spesifik] dengan [teknologi kunci]

### Opsi judul untuk stroke app (best to worst):

#### Opsi 1 (REKOMENDASI — paling GEMASTIK-aligned)
**"RehabTrack: Sistem Monitoring Rehabilitasi Pasca-Stroke Berbasis Smartphone dengan Pelacakan Range-of-Motion Menggunakan Gyroscope dan Tele-Supervision Asinkron"**

Breakdown:
- **RehabTrack** — nama singkat, jelas niche (rehabilitasi bukan stroke umum, karena stroke adalah penyakit spesifik tapi nama produk lebih generic untuk fleksibilitas)
- **Sistem Monitoring** — kategori (monitoring, bukan diagnosis)
- **Pasca-Stroke** — masalah spesifik + target user (bukan "health app" yang terlalu umum)
- **Berbasis Smartphone** — constraint teknis (software-only, no special hardware)
- **Pelacakan Range-of-Motion** — teknologi kunci #1 (ROM adalah core metric)
- **Gyroscope** — sensor spesifik (menunjukkan tidak ada hardware invasif)
- **Tele-Supervision Asinkron** — teknologi kunci #2 (therapist loop yang membedakan dari fitness tracking apps)

**Panjang:** terlalu panjang untuk slogan marketing, tapi perfect untuk GEMASTIK submission judul

**Strength:**
- Menjelaskan innovation: ROM tracking + async therapist review (bukan sekadar fitness app)
- Bahasa Indonesia naturel
- Tidak mention TB Vector, fully independent positioning

---

#### Opsi 2 (alternatif, lebih pendek)
**"StrokeGuide: Platform Rehabilitasi Pasca-Stroke Terintegrasi dengan Monitoring Real-time dan Feedback Terapis Berbasis Aplikasi Mobile"**

- Lebih consumer-facing ("StrokeGuide" catchier)
- Tapi agak samar soal ROM tracking vs fitness tracking generic
- Lebih cocok untuk marketing daripada GEMASTIK technical judging

---

#### Opsi 3 (jika ingin elegan dan singkat)
**"ROMMonitor: Sistem Tracking ROM Pasca-Stroke Berbasis Gyroscope Smartphone untuk Optimalisasi Adhesi Terapi Rumah"**

- "ROM" sebagai hero (bukan nama product, tapi teknologinya)
- "Adhesi" is a good clinical term (adherence to therapy)
- Lebih technical, cocok untuk judge yang clinically-savvy

---

### **Rekomendasi final: Opsi 1 (RehabTrack)**
Alasan: paling sesuai format TB Vector + bersih dari mention kompetitor + positioning jelas untuk GEMASTIK juries.

---

## 2. Scope Audit: MVP + Phase 2 untuk 6-month timeline (Anda)

**Anda target:** Selesai Phase 2 dalam 6 bulan (tidak perlu Phase 3).

**Question:** Apakah MVP+Phase2 terlalu banyak?

Mari saya audit berdasarkan GEMASTIK prior winners' pattern.

---

## 3. Breakdown MVP vs Phase 2

### MVP (Weeks 0–4 development)
```
✅ 3 exercises (gyroscope ROM tracking)
✅ Local session storage + cloud sync
✅ Patient progress dashboard
✅ Therapist async dashboard + weekly notes
✅ Video call link (external Zoom/Meet)
✅ Bahasa Indonesia UI
```
**Fitur count MVP:** 6 major features  
**Complexity:** LOW — pure signal processing, no ML  
**Validation required:** ≥15 patients, 4 weeks pilot → accuracy ≥75%

### Phase 2 (Weeks 5–16 development, authorized to start immediately)
```
✅ Camera: facial asymmetry detection (MediaPipe, on-device)
✅ Audio: speech clarity scoring (TFLite, on-device)
✅ Expanded exercise library (+3–5 exercises)
✅ Persistent session flagging (therapist-side)
✅ Templated notes for therapist
```
**Fitur count Phase 2:** 5 new major features  
**Complexity:** MEDIUM — adds ML/CV but using pre-trained models only  
**Validation required:** Second pilot with Phase 2 features, ≥20 patients, 6 weeks

---

## 4. Reality Check: Is this realistic in 6 months?

### Comparison to GEMASTIK 2026 winners

| Project | Innovation vector | Scope at submission |
|---|---|---|
| **TB Vector (Winner 1)** | Audio ML (LSTM) + spatial tracking (DoA/beamforming) | Single problem (TB detection) but sophisticated signal processing |
| **Snailly (Winner 2)** | Content filtering via SVM + tiered feature design | Multi-feature (Surfior, Notifior, Reportior) but same core tech (SVM) across all |
| **Timses 417135 (Winner 3)** | Team dispatch algorithms + geo-mapping | Operationally rich but not technically cutting-edge (standard geospatial + scheduling) |

**Pattern:** Winners bundle **multiple features around ONE clear innovation** rather than spreading thin across many innovations.

---

## 5. Your MVP+Phase2 positioning

### Innovation vector
```
MVP:  Gyroscope ROM tracking + async therapist loop
       (hardware-free, software-clever approach to a clinical problem)

Phase 2: Multi-modal detection
         (gyro + camera + audio = three independent signals 
          for triangulating post-stroke recovery status)
```

**Is this defensible?** YES. The **combination** of lightweight sensors + async therapist workflow is the innovation, not any single sensor. TB Vector has fancier signal processing, but your innovation is **architectural** (how you integrate patient autonomy + therapist oversight at low cost in rural/resource-limited settings).

---

## 6. Timeline feasibility assessment

### Week 0–4: MVP build + Phase 0–8 of implementation_plan
- Feasible IF you have 40 hrs/week and the dev team is sharp
- Gyroscope + storage + basic dashboards = straightforward
- **Risk:** underestimating polish, accessibility, edge cases → likely +1–2 weeks if not disciplined

### Week 4–8: MVP pilot (validation track; can run in parallel)
- ≥15 patients, ≥4 weeks real use
- This validates the MVP and informs Phase 2 tuning; it is not a prerequisite for starting Phase 2
- **Risk:** recruitment delays; allows 1–2 week slip

### Week 9–16: Phase 2 build (camera + audio ML integration)
- MediaPipe Face Landmarker = drop-in library (week 1–2)
- TFLite audio model = open-source options exist, adapt one (week 2–3)
- Therapist dashboard enhancements + templated notes = (week 2–3)
- Expand exercise library = implementation_plan.md phase already templated (week 1–2)
- Overlap all of this in parallel → 4–5 weeks realistic

### Week 17–20: Phase 2 pilot + refinement
- Deploy to second cohort of patients, run for 6+ weeks
- Iterate on multi-modal signals based on feedback

### Week 21–26: Polish for GEMASTIK submission
- Documentation
- Video demo
- Pitch deck
- Final accuracy/usability metrics

---

## 7. Risk level: MVP + Phase 2

| Risk | Severity | Mitigation |
|---|---|---|
| MVP pilot recruitment delays | MEDIUM | Start outreach while building (parallel path) |
| Phase 2 ML model accuracy disappoints | MEDIUM | Have fallback plan to ship Phase 2 with less aggressive ML (e.g. just camera, defer audio) |
| Scope creep (adding feature X from Phase 3 early) | HIGH | `rules.md` enforces discipline; agent won't add features not in plan without explicit approval |
| Therapist adoption friction in pilot | MEDIUM | Design dashboard with therapist UX feedback from MVP (week 4–8), iterate in Phase 2 |
| GEMASTIK deadline slip | LOW–MEDIUM | 6-month buffer is realistic if Phase 0–8 takes 4 weeks + pilot is parallel-tracked |

**Overall risk level:** MEDIUM. Doable, but requires:
1. Tight scope discipline (rules.md enforces this)
2. Parallel pilot during Phase 2 dev (don't serialize them)
3. Willingness to descope Phase 2 audio if time becomes critical (keep camera, defer audio to "advanced optional")

---

## 8. Is MVP+Phase2 overkill for GEMASTIK?

### Compared to prior winners:
- **TB Vector:** Single sophisticated innovation (audio ML + spatial tracking) → won
- **Your plan:** Two innovations (gyroscope ROM + async therapist loop) bundled with multi-modal sensing (Phase 2) → competitive

### What judges care about:
1. **Innovation (20%):** Yours clear — novel combo of lightweight sensors + clinical workflow. Phase 2 adds depth.
2. **Impact (20%):** ~500k stroke survivors/year in Indonesia. Phase 2 scales impact (more confident detection).
3. **UI/UX (20%):** Both Phase 1 and Phase 2 contribute (Phase 2 adds complexity but dashboards get richer).
4. **Methodology (20%):** Clinical validation in pilot is THE differentiator. Phase 2 proves methodological rigor (iterate based on pilot data, not just build-and-hope).
5. **Urgency (10%):** Stroke = urgent. Phase 2 doesn't hurt, might help (faster/more accurate detection).

**Verdict:** **MVP+Phase2 is NOT overkill — it's proportional to GEMASTIK standards.** TB Vector has fancier ML; you have broader clinical integration. They're different innovation strategies, both valid.

---

## 9. Recommendation

### Best case scenario:
- **Deliver:** MVP fully working + Phase 2 multi-modal detection validated
- **GEMASTIK score estimate:** 78–86% (competitive with Winner 1–2)
- **Realistic?** Yes, if team is disciplined and parallel-tracks pilot + Phase 2 dev

### Acceptable fallback (if time gets tight):
- **Deliver:** MVP fully working + Phase 2 **camera only** (audio deferred to post-submission as "advanced feature for Phase 2b")
- **GEMASTIK score estimate:** 75–82% (still very strong)
- **Why acceptable?** Judges value execution quality + clinical validation over feature count; a well-executed gyro+camera combo beats a half-baked gyro+camera+audio

### Do NOT do:
- Build Phase 3 (BPJS, admin consoles, push notifications) before GEMASTIK — this is actual scope creep that hurts by diluting focus

---

## 10. Action items

1. **Decide on judul:** Opsi 1 (RehabTrack) recommended. Saya bisa update all 6 docs + README setelah Anda konfirmasi.

2. **Scope lock:** MVP + Phase 2 seems realistic. Confirm dengan tim Anda:
   - Can we commit 40 hrs/week development Sep–Dec 2025?
   - Can we start therapist/patient recruitment in parallel (Week 1 outreach while Week 0–4 dev happens)?

3. **Next document:** Saya bikin **SUBMISSION_STRATEGY.md** yang maps:
   - Mana fitur yang disebutkan di pitch (mana yang MVP, mana Phase 2)
   - Mana bukti/metrics yang diperlukan per GEMASTIK rubric
   - Timeline submission (kapan finalize docs, kapan push ke GitHub, kapan demo video recorded)

Mau saya lanjutin?

---

## Related documents
- `prd.md` — MVP scope
- `roadmap-phase2-3.md` — Phase 2/3 full details
- `rules.md` — scope discipline that keeps this realistic
