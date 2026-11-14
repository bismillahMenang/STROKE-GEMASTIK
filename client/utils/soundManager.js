// Preloads and plays exercise-zone transition sounds (PulihGo soundManager).
//
// SAFETY: the ceiling-warning is a WARNING tone, NOT a reward. Both sounds
// fire exactly once per zone transition (see ExerciseSession).
//
// Uses expo-audio (SDK 57). Lazy initialization on first play — audio must
// never crash or block a practice session.

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const TARGET_REACHED_ASSET = require('../assets/sounds/target-reached.wav');
const CEILING_WARNING_ASSET = require('../assets/sounds/ceiling-warning.wav');

let targetPlayer = null;
let ceilingPlayer = null;
let initialized = false;

async function ensureInitialized() {
  if (initialized) return;
  initialized = true;

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });

    targetPlayer = createAudioPlayer(TARGET_REACHED_ASSET);
    targetPlayer.volume = 0.5;

    ceilingPlayer = createAudioPlayer(CEILING_WARNING_ASSET);
    ceilingPlayer.volume = 1.0;
    ceilingPlayer.loop = true;
  } catch (error) {
    console.warn('[soundManager] Failed to initialize audio:', error);
  }
}

function replay(player) {
  if (!player) return;
  try {
    player.seekTo(0);
    player.play();
  } catch (error) {
    console.warn('[soundManager] Playback error (non-fatal):', error);
  }
}

/** Short positive "ding" when the patient reaches their target ROM. */
export async function playTargetReached() {
  await ensureInitialized();
  replay(targetPlayer);
}

/** Neutral warning tone (looping) while ROM exceeds the safe ceiling. */
export async function playCeilingWarning() {
  await ensureInitialized();
  replay(ceilingPlayer);
}

/** Stop the ceiling warning loop when the patient returns to a safe zone. */
export async function stopCeilingWarning() {
  if (!ceilingPlayer) return;
  try {
    ceilingPlayer.pause();
    ceilingPlayer.seekTo(0);
  } catch (error) {
    console.warn('[soundManager] Stop ceiling error (non-fatal):', error);
  }
}