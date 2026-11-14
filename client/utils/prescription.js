// Offline-first prescription resolution:
//   1. live from the server (and re-cache it),
//   2. else the last successfully fetched plan (offline after being online),
//   3. else built-in defaults (fresh install, never online).
// Always resolves within PRESCRIPTION_FETCH_TIMEOUT_MS. Never throws — a
// prescription must never block or crash a practice session.

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPrescription, TOKEN_KEY } from '../api/client';
import {
  DEFAULT_ROM_CEILING_DEG,
  MAX_REPS,
  PRESCRIPTION_FETCH_TIMEOUT_MS,
} from './constants';

const CACHE_PREFIX = '@rehabtrack/prescription.v1:';

/** Reject rows a buggy write or hand-edited data could produce. */
function isSane(rx) {
  return (
    rx &&
    Number.isFinite(rx.targetRomDeg) && rx.targetRomDeg > 0 &&
    Number.isFinite(rx.romCeilingDeg) && rx.romCeilingDeg > 0 &&
    Number.isFinite(rx.targetReps) && rx.targetReps > 0
  );
}

async function readCache(exerciseKey) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + exerciseKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null; // corrupt cache = no cache
  }
}

function writeCache(exerciseKey, rx) {
  // Fire-and-forget: a failed cache write must never surface to the patient.
  AsyncStorage.setItem(CACHE_PREFIX + exerciseKey, JSON.stringify(rx)).catch(() => {});
}

export function defaultPrescription(exercise) {
  return {
    targetRomDeg: exercise.targetRom,
    romCeilingDeg: exercise.romCeilingDeg ?? DEFAULT_ROM_CEILING_DEG,
    targetReps: MAX_REPS,
    source: 'default',
  };
}

export async function resolveActivePrescription(exercise, token) {
  let server = null;

  if (token) {
    try {
      const timeout = new Promise((resolve) => setTimeout(() => resolve(null), PRESCRIPTION_FETCH_TIMEOUT_MS));
      const result = await Promise.race([fetchPrescription(exercise.key, token), timeout]);
      if (isSane(result)) {
        server = result;
        writeCache(exercise.key, server);
      }
    } catch (error) {
      console.warn('[prescription] server fetch failed, will fall back', error);
    }
  }

  if (server) return { ...server, source: 'server' };

  const cached = await readCache(exercise.key);
  if (isSane(cached)) return { ...cached, source: 'cache' };

  return defaultPrescription(exercise);
}

// React wrapper (PulihGo usePrescription.ts): fetches ONCE on mount. While
// resolving, `rx` already holds built-in defaults so nothing downstream ever
// sees undefined; `status` lets the UI show "memuat rencana latihan…".
export function usePrescription(exercise) {
  const [state, setState] = useState({
    rx: defaultPrescription(exercise),
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const rx = await resolveActivePrescription(exercise, token);
      if (!cancelled) setState({ rx, status: 'ready' });
    })();
    return () => { cancelled = true; };
  }, [exercise?.key]);

  return state;
}