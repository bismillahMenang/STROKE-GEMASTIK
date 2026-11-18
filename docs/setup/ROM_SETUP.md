# Synthetic ROM Fixture Setup

Files:

- `client/tests/generate_rom_fixtures.js`
- `client/tests/rom.test.js`
- Generated output: `client/tests/fixtures/rom_*.json`

The generator uses the same `client/utils/gyroProcessing.js` algorithm used by the mobile app. Readings are angular velocity in radians per second at 100 Hz.

## 1. Generate 45 fixtures

```powershell
node client/tests/generate_rom_fixtures.js
```

It creates 15 files for each Phase 2 exercise:

- `wrist_flexion`: 10 normal, 5 impaired.
- `finger_extension`: 10 normal, 5 impaired.
- `resistance_band_row`: 10 normal, 5 impaired.

The targets are provisional monitoring targets from `client/utils/constants.js`, not clinical prescriptions.

## 2. Run the nine tests

```powershell
node --test client/tests/rom.test.js
```

Expected result: 9 passing tests.

## 3. Verify fixture count

```powershell
(Get-ChildItem client/tests/fixtures -Filter 'rom_*.json').Count
```

Expected output:

```text
45
```

Synthetic ROM separation does not establish measurement accuracy on patients. Physical-device testing and goniometer comparison remain separate validation work.
