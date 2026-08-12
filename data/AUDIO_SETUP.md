# Synthetic Audio Fixture Setup

Files:

- `data/generate_audio_fixtures.js`
- `data/dysarthria.test.js`
- Generated output: `data/test/fixtures/*.wav`

The generator uses only Node built-ins. It does not require Tone, Jest, or an external audio package.

## 1. Generate six WAV files

From the repository root:

```powershell
node data/generate_audio_fixtures.js
```

The generator creates:

- 3 normal speech-like signals.
- 2 moderate dysarthria-like signals.
- 1 severe dysarthria-like signal.

These are deterministic synthetic signals, not recordings of people and not clinical evidence.

## 2. Run the eight tests

```powershell
node --test data/dysarthria.test.js
```

Expected result: 8 passing tests.

## 3. Score semantics

`computeDysarthriaScore` returns a clarity score:

- Higher values indicate a clearer synthetic signal.
- Lower values indicate a more dysarthria-like synthetic signal.
- Threshold `0.4` is only a synthetic fixture threshold.

## 4. Inspect WAV count

```powershell
(Get-ChildItem data/test/fixtures -Filter '*.wav').Count
```

Expected output:

```text
6
```

Do not report these synthetic pass rates as sensitivity or specificity for real patients. Real, consented speech samples must be validated separately.
