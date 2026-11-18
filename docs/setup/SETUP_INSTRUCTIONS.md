# Phase 2 Facial Fixture Setup

> Status: rencana. `client/tests/generate_facial_fixtures.js` dan `client/tests/facial_asymmetry.test.js` belum ada di repositori. Jangan menganggap fixture wajah sudah tersedia.

The generator and test already live in `client/tests/`:

- `client/tests/generate_facial_fixtures.js`
- `client/tests/facial_asymmetry.test.js`
- `client/tests/fixtures/` (generated output)

The fixtures are deterministic synthetic geometry. They are for algorithm smoke testing only, not clinical validation data.

## 1. Generate fixtures

From the repository root:

```powershell
node client/tests/generate_facial_fixtures.js
```

This creates six JSON files in `client/tests/fixtures/`:

```text
normal_face_1.json
normal_face_2.json
normal_face_3.json
moderate_asymmetry_1.json
moderate_asymmetry_2.json
severe_asymmetry_1.json
```

## 2. Run the tests

Node 18 or newer is required because the test uses the built-in `node:test` runner:

```powershell
node --test client/tests/facial_asymmetry.test.js
```

Expected result: 8 passing tests.

## 3. Interpret the score

The current product utility is `client/utils/faceMetrics.js`:

- `0` means symmetric.
- A larger value means more asymmetry.
- The synthetic smoke threshold is `0.1`.

These thresholds are not clinical cutoffs and must not be presented as diagnostic evidence.

## 4. Verify the implementation path

The test imports the same utility used by the mobile camera flow:

```javascript
const { calculateAsymmetryScore } = require('../utils/faceMetrics');
```

If the utility changes, update the test import and rerun the generator before running the test suite.

## 5. Optional checks

Check generated fixture count:

```powershell
(Get-ChildItem client/tests/fixtures -Filter '*.json').Count
```

Expected output:

```text
6
```

The next validation step is to add real, consented landmark samples separately. Do not mix them into the synthetic fixtures or claim synthetic pass rates as clinical sensitivity/specificity.
