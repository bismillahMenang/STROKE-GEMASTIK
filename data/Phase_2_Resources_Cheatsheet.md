# Phase 2 Resources Cheatsheet
## Quick Reference for Data, Libraries, Commands

---

## 📊 Datasets (All Free/Open Access)

### Facial Asymmetry & Landmarks

| Dataset | Size | Link | Use Case | License |
|---------|------|------|----------|---------|
| **CelebA** | 202K faces × 40 attributes | https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html | Normal baseline, symmetry ground truth | Custom (attribution required) |
| **FaceDB** | 6,977 faces × 13 poses | https://github.com/visionjo/facedatabase-dl | Multi-angle facial geometry | CC BY-SA |
| **300 Faces in-the-Wild** | 300 unconstrained faces | https://ibug.doc.ic.ac.uk/resources/facial-point-annotations/ | Real-world facial landmarks | Custom academic |
| **CMU-MOABB** | 600+ AU action unit sequences | https://www.cs.cmu.edu/~face/facs.html | Asymmetric expressions (droop simulation) | Academic use |
| **LFW (Labeled Faces in Wild)** | 13,233 faces | http://vis-www.cs.umass.edu/lfw/ | Demographic diversity | Public domain |

### Speech & Dysarthria

| Dataset | Size | Link | Use Case | License |
|---------|------|------|----------|---------|
| **TIMIT** | 6,300 utterances, 630 speakers | https://openslr.org/timit.html | Normal speech baseline (phoneme-level) | NIST (academic) |
| **LibriSpeech** | 1,000+ hours English speech | https://www.openslr.org/12 | Clean & noisy speech diversity | CC BY 4.0 |
| **Dysarthric Speech Database** | 109 speakers (cerebral palsy) | https://www.uec.ac.jp/~kazuhiro/DB/dysarthric.html | **Real dysarthric data** (limited) | Contact authors |
| **Mozilla Common Voice** | 20K+ hours multilingual | https://commonvoice.mozilla.org | Demographic diversity, noise | CC0 (public domain) |
| **Stroke Recovery Corpus** | Limited, research studies | ResearchGate / OSF.io | Stroke-specific speech (search individual studies) | Varies |

### Gyroscope ROM Reference Data

| Data Type | Source | Use Case |
|-----------|--------|----------|
| **Synthetic trajectories** | Bezier curve generators (homemade) | Normal ROM ranges for wrist, finger, band row |
| **Android IMU samples** | Android Developer docs (SensorManager) | Device-specific gyro noise profiles |
| **Physical therapy ROM tables** | PubMed / clinical literature | Normal ROM by joint (e.g., wrist flexion 0–80°) |

---

## 🛠 Required Libraries

### Python (Data Generation & Testing)

```bash
# Install all at once
pip install opencv-python librosa numpy scipy pandas matplotlib scikit-learn

# Individual packages:
# opencv-python       — face detection, image transforms (asymmetry simulation)
# librosa             — audio feature extraction (MFCC, pitch, speaking rate)
# numpy, scipy        — math operations, signal processing
# pandas              — data wrangling (test results)
# matplotlib          — visualization (ROC curves, confusion matrices)
# scikit-learn        — ROC-AUC, sensitivity/specificity calculations
```

### JavaScript/Node (Algorithm Implementation & Testing)

```bash
# Core testing
npm install --save-dev jest

# Audio processing (web audio API, not Node)
npm install web-audio-api  # For Node testing only

# Face detection (React Native / browser)
npm install @react-native-camera/camera expo-face-detector  # Mobile
npm install @vladmandic/face-api  # Web/testing environment

# Feature extraction (speech)
npm install meyda  # Audio feature library

# Data visualization
npm install recharts chart.js
```

### React Native / Expo (Mobile Implementation)

```bash
npx expo install expo-sensors          # Gyroscope access
npx expo install expo-camera           # Camera + permissions
npx expo install expo-av              # Audio recording
npx expo install expo-face-detector    # Face detection wrapper
npx expo install @react-native-async-storage/async-storage
```

---

## 🔧 Commands Cheatsheet

### Week 1: Data Preparation

```bash
# Download CelebA (you may need to register)
# Manual download from: https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html
# Or use a dataset downloader script
python -c "
import urllib.request
import zipfile
# Download smaller subset or use mirror if available
"

# Download TIMIT (requires permission/research credentials)
# Alternative: use OpenSLR's subset
wget https://openslr.org/resources/3/TIMIT.tar.gz
tar xzf TIMIT.tar.gz

# Download LibriSpeech (300 MB subset)
wget https://www.openslr.org/resources/12/dev-clean.tar.gz
tar xzf dev-clean.tar.gz

# Start your data generator scripts
python data/facial_asymmetry_generator.py --output synthetic_faces/ --count 150
python data/dysarthria_generator.py --input TIMIT/ --output synthetic_speech/ --count 120
node data/rom_trajectory_generator.js --output synthetic_gyro/ --exercises 3
```

### Week 2: Algorithm Implementation

```bash
# Set up React Native project (if starting fresh)
npx create-expo-app@latest client

# Add required packages
cd client
npx expo install expo-sensors expo-camera expo-av expo-face-detector

# Test gyroscope capture locally (Expo Go)
npx expo start

# Create native build (when ready for camera/audio)
npx expo prebuild
npx expo run:android  # or run:ios if on macOS

# Check Android version / device info
adb devices
adb shell getprop ro.build.version.release
```

### Week 3: Testing & Validation

```bash
# Run unit tests
npm run test:phase2
# OR manually:
npm run test -- --testPathPattern="facial_asymmetry|dysarthria|rom"

# Generate validation report
npm run test:phase2 -- --json --outputFile=VALIDATION_RESULTS.json

# Visualize ROC curves (Python)
python scripts/plot_validation_curves.py \
  --results VALIDATION_RESULTS.json \
  --output ./validation_plots/

# Measure test coverage
npm run test:phase2 -- --coverage
```

### Week 4: Physical Device Testing

```bash
# Build APK for Android testing
cd client
npx expo run:android

# Install APK on device via adb
adb install -r dist/app-release.apk

# Run app on device and check logs
adb logcat -s PulihTrack

# Measure performance (memory, CPU)
adb shell dumpsys meminfo com.rehabtrack
adb shell top -n 1 | grep rehabtrack

# Test camera permissions
adb shell pm grant com.rehabtrack android.permission.CAMERA
adb shell pm grant com.rehabtrack android.permission.RECORD_AUDIO

# View device sensors
adb shell getprop ro.hardware.keystore
adb shell dumpsys sensorservice
```

### Week 5: Proposal Writing

```bash
# Create proposal document (if using markdown)
pandoc proposal.md -o proposal.pdf \
  --template eisvogel \
  --listings

# Or compile with LaTeX (if template provided)
pdflatex proposal.tex

# Embed figures & validation results
# Use Markdown:
![ROC Curve](./validation_plots/roc_curve.png)
![Confusion Matrix](./validation_plots/confusion_matrix.png)

# Archive appendices
tar czf VALIDATION_APPENDICES.tar.gz \
  VALIDATION_RESULTS.json \
  VALIDATION_PROTOCOL.md \
  DEVICE_QA_REPORT.md \
  validation_plots/
```

### Week 6: Final Submission

```bash
# Generate final APK for judges
cd client
npx expo build:android  # or use EAS Build (easier)
# OR
npx eas build --platform android

# Verify APK signature & integrity
jarsigner -verify -verbose -certs dist/app-release.apk

# Create submission package
mkdir GEMASTIK_SUBMISSION/
cp proposal.pdf GEMASTIK_SUBMISSION/
cp app-release.apk GEMASTIK_SUBMISSION/
cp VALIDATION_APPENDICES.tar.gz GEMASTIK_SUBMISSION/
cp clinical_validation_summary.pdf GEMASTIK_SUBMISSION/
cp -r src/ GEMASTIK_SUBMISSION/source_code/

# Compress for upload
zip -r GEMASTIK_2026_PulihTrack_Phase2.zip GEMASTIK_SUBMISSION/

# Verify file sizes (judges may have limits)
du -sh GEMASTIK_SUBMISSION/
# Expected: 200–400 MB (APK + code + docs)
```

---

## 📝 File Structure Setup

```
rehabtrack/
├── data/
│   ├── facial_asymmetry_generator.py      # Generate synthetic asymmetric faces
│   ├── dysarthria_generator.py             # Generate synthetic speech
│   └── rom_trajectory_generator.js         # Generate synthetic gyro data
├── test/
│   ├── facial_asymmetry.test.js            # Algorithm validation
│   ├── dysarthria.test.js                  # Algorithm validation
│   ├── rom_new_exercises.test.js           # ROM algorithm validation
│   └── fixtures/                           # Test data (synthetic outputs)
├── client/
│   ├── utils/
│   │   ├── facialSymmetry.js               # Asymmetry score calculation
│   │   ├── dysarthriaDetection.js          # Dysarthria score calculation
│   │   └── romProcessing.js                # (existing gyro ROM processing)
│   └── screens/
│       └── AssessmentSession.js            # Phase 2 camera/audio screen
├── scripts/
│   ├── plot_validation_curves.py           # Visualization (ROC, confusion matrix)
│   └── generate_validation_report.js       # Parse test results → JSON
├── VALIDATION_PROTOCOL.md                  # Clinical threshold documentation
├── VALIDATION_RESULTS.json                 # Test results (auto-generated)
├── DEVICE_QA_REPORT.md                     # Physical device testing log
└── proposal.md                             # GEMASTIK proposal
```

---

## 🎯 Key Thresholds (Clinical Anchors)

### Facial Asymmetry
- **Normal (symmetric):** score 0.85–1.0 (healthy face, symmetry index < 0.15)
- **Mild asymmetry:** score 0.55–0.75 (slight droop, noticeable but mild)
- **Moderate asymmetry:** score 0.25–0.45 (clear stroke droop)
- **Severe asymmetry:** score 0.05–0.25 (significant facial weakness)

**Clinical decision threshold:** 0.30 (flags moderate-to-severe, warrants therapist review)

**Source:** Stroke facial droop severity scales; computed from MediaPipe 468-point landmarks

### Dysarthria
- **Normal speech:** score 0.85–1.0 (clear articulation, normal rate/pitch)
- **Mild dysarthria:** score 0.55–0.75 (slight vocal strain, minor rate reduction)
- **Moderate dysarthria:** score 0.25–0.45 (noticeable slurring, significant strain)
- **Severe dysarthria:** score 0.05–0.25 (severe slurring, unintelligible)

**Clinical decision threshold:** 0.40 (flags moderate-to-severe dysarthria)

**Source:** Frenchay Dysarthria Assessment Scale; extracted from pitch stability, MFCC, speaking rate

### ROM (New Exercises)
- **Wrist flexion:** 0–80° (normal); <40° = impaired
- **Finger extension:** 0–90° (normal); <45° = impaired
- **Resistance-band row:** full ROM depends on band tension; baseline from prior sessions

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| CelebA download blocked | Use mirror (e.g., drive.google.com) or request access via official site |
| TIMIT requires license | Use LibriSpeech or Common Voice as alternative |
| Face detection fails on dark skin tones | Document as known limitation; test on diverse CelebA subset |
| Android camera permissions denied | `adb shell pm grant COM.REHABTRACK android.permission.CAMERA` |
| Gyroscope not detected on emulator | Use physical device; emulator sensors are simulated |
| MFCC extraction too slow | Pre-compute features offline; cache in SQLite |
| Native build fails on prebuild | Check Node/Expo/Android SDK versions: `expo diagnostics` |

---

## 📚 Reference Papers (for proposal citations)

**Facial asymmetry & stroke:**
- Brott et al. (1989) — NIH Stroke Scale (facial droop assessment)
- Saver et al. (2016) — Cochrane review on stroke outcome measures

**Dysarthria & stroke:**
- Yorkston et al. (1996) — Dysarthria severity assessment
- Flowers et al. (2004) — Frenchay Dysarthria Assessment Scale

**ROM & rehabilitation:**
- Kwakkel et al. (2004) — Predictive value of upper limb ROM in stroke recovery

**ML validation best practices:**
- Fawcett (2006) — ROC analysis; sensitivity/specificity interpretation
- Altman & Bland (1994) — Diagnostic accuracy studies

---

## 🚀 Git Workflow (Recommended)

```bash
# Phase 2 branch
git checkout -b phase2/clinical-validation

# Weekly commits
git add data/
git commit -m "feat: facial asymmetry generator + dysarthria synthetic data"

git add client/utils/facialSymmetry.js client/utils/dysarthriaDetection.js
git commit -m "feat: implement asymmetry & dysarthria scoring algorithms"

git add test/
git commit -m "feat: validation test suite + VALIDATION_RESULTS.json"

git add DEVICE_QA_REPORT.md
git commit -m "docs: device QA report + known limitations"

# Final push before submission
git merge --no-ff develop
git tag phase2-release
git push origin phase2-release
```

---

## 📞 Support Resources

- **Expo Docs:** https://docs.expo.dev/ (React Native, sensors, camera)
- **MediaPipe:** https://mediapipe.dev/ (face detection, landmarks)
- **Librosa:** https://librosa.org/ (audio feature extraction)
- **OpenSLR:** https://openslr.org/ (speech datasets)
- **GEMASTIK FAQ:** Check official guidelines PDF for submission details

---

**Last updated:** August 2026  
**Maintained by:** Andry (PulihTrack team)
