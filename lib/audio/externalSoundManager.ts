import {
  AUDIO_ASSETS,
  AUDIO_VOLUME,
  MUSIC_ASSETS,
  MUSIC_VOLUME,
  type AudioAssetSource,
  type GameSoundKey,
  type MusicKey,
} from "./audioAssets";

const SOUND_ENABLED_KEY = "dashTo30_soundEnabled:v1";
const MUSIC_ENABLED_KEY = "dashTo30_musicEnabled:v1";
const LEGACY_SOUND_ENABLED_KEY = "dashTo30_soundEnabled";
const AUDIO_SETTINGS_EVENT = "dashTo30-audio-settings-changed";

const MAX_POOL_SIZE = 6;

export type AudioSettingsState = {
  soundEnabled: boolean;
  musicEnabled: boolean;
};

type DashAudioState = {
  unlocked: boolean;
  musicSuspended: boolean;
  activeMusic: HTMLAudioElement | null;
  activeMusicKey: MusicKey | null;
  desiredMusicKey: MusicKey | null;
  sfxPool: Map<string, HTMLAudioElement[]>;
  musicPool: Set<HTMLAudioElement>;
};

declare global {
  interface Window {
    __DT30_AUDIO_STATE__?: DashAudioState;
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

function getState(): DashAudioState | null {
  if (!isBrowser()) return null;

  if (!window.__DT30_AUDIO_STATE__) {
    window.__DT30_AUDIO_STATE__ = {
      unlocked: false,
      musicSuspended: false,
      activeMusic: null,
      activeMusicKey: null,
      desiredMusicKey: null,
      sfxPool: new Map<string, HTMLAudioElement[]>(),
      musicPool: new Set<HTMLAudioElement>(),
    };
  }

  return window.__DT30_AUDIO_STATE__;
}

function readBool(key: string, fallback: boolean) {
  if (!isBrowser()) return fallback;

  const value = window.localStorage.getItem(key);
  if (value === null) return fallback;

  return value === "true";
}

function writeBool(key: string, value: boolean) {
  if (!isBrowser()) return;

  window.localStorage.setItem(key, String(value));
}

function emitAudioSettingsChanged() {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new CustomEvent<AudioSettingsState>(AUDIO_SETTINGS_EVENT, {
      detail: getAudioSettings(),
    }),
  );
}

function normalizeAssetList(source: AudioAssetSource) {
  return Array.isArray(source) ? source.filter(Boolean) : [source];
}

function pickAssetSource(source: AudioAssetSource) {
  const list = normalizeAssetList(source);

  if (list.length === 0) return null;
  if (list.length === 1) return list[0];

  return list[Math.floor(Math.random() * list.length)];
}

export function getAudioSettingsEventName() {
  return AUDIO_SETTINGS_EVENT;
}

export function isSoundEnabled() {
  if (!isBrowser()) return true;

  const currentValue = window.localStorage.getItem(SOUND_ENABLED_KEY);

  if (currentValue !== null) {
    return currentValue === "true";
  }

  const legacyValue = window.localStorage.getItem(LEGACY_SOUND_ENABLED_KEY);

  if (legacyValue !== null) {
    const migrated = legacyValue === "true";
    writeBool(SOUND_ENABLED_KEY, migrated);
    window.localStorage.removeItem(LEGACY_SOUND_ENABLED_KEY);
    return migrated;
  }

  return true;
}

export function isMusicEnabled() {
  return readBool(MUSIC_ENABLED_KEY, true);
}

export function getAudioSettings(): AudioSettingsState {
  return {
    soundEnabled: isSoundEnabled(),
    musicEnabled: isMusicEnabled(),
  };
}

export function setSoundEnabled(value: boolean) {
  writeBool(SOUND_ENABLED_KEY, value);

  if (isBrowser()) {
    window.localStorage.removeItem(LEGACY_SOUND_ENABLED_KEY);
  }

  emitAudioSettingsChanged();
}

export function setMusicEnabled(value: boolean) {
  writeBool(MUSIC_ENABLED_KEY, value);

  if (!value) {
    stopMusic();
  } else {
    const state = getState();

    if (state) {
      state.musicSuspended = false;
    }

    if (state?.desiredMusicKey) {
      startMusic(state.desiredMusicKey);
    }
  }

  emitAudioSettingsChanged();
}

export async function unlockExternalAudio() {
  const state = getState();

  if (!state) return;

  state.unlocked = true;

  try {
    const audio = getPooledAudio(normalizeAssetList(AUDIO_ASSETS.uiClick)[0]);

    if (audio) {
      audio.volume = 0;
      audio.currentTime = 0;

      await audio.play();

      audio.pause();
      audio.currentTime = 0;
    }
  } catch {
    // Browser can still reject until a valid user gesture.
  }

  if (state.desiredMusicKey && isMusicEnabled() && !state.musicSuspended) {
    startMusic(state.desiredMusicKey);
  }
}

export function toggleSoundEnabled() {
  const next = !isSoundEnabled();

  const state = getState();
  if (state) state.unlocked = true;

  playGameSound("settingsToggle", { force: true });
  setSoundEnabled(next);

  return next;
}

export function toggleMusicEnabled() {
  const next = !isMusicEnabled();

  const state = getState();

  if (state) {
    state.unlocked = true;
    state.musicSuspended = false;
  }

  playGameSound("settingsToggle", { force: true });
  setMusicEnabled(next);

  return next;
}

function getPooledAudio(src: string) {
  const state = getState();

  if (!state) return null;

  let pool = state.sfxPool.get(src);

  if (!pool) {
    pool = [];
    state.sfxPool.set(src, pool);
  }

  const reusable = pool.find((audio) => audio.paused || audio.ended);

  if (reusable) return reusable;

  if (pool.length < MAX_POOL_SIZE) {
    const audio = new Audio(src);
    audio.preload = "auto";
    pool.push(audio);
    return audio;
  }

  return pool[0];
}

export function preloadAudio() {
  if (!isBrowser()) return;

  const uniqueSfx = new Set<string>();

  Object.values(AUDIO_ASSETS).forEach((source) => {
    normalizeAssetList(source).forEach((src) => uniqueSfx.add(src));
  });

  uniqueSfx.forEach((src) => {
    const audio = getPooledAudio(src);

    if (!audio) return;

    audio.preload = "auto";
    audio.load();
  });
}

export function playGameSound(
  key: GameSoundKey,
  options: { force?: boolean } = {},
) {
  if (!isBrowser()) return;

  const state = getState();

  if (state) {
    state.unlocked = true;
  }

  if (!options.force && !isSoundEnabled()) return;

  const src = pickAssetSource(AUDIO_ASSETS[key]);

  if (!src) return;

  try {
    const audio = getPooledAudio(src);

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.volume = AUDIO_VOLUME[key] ?? 0.5;

    void audio.play();
  } catch (error) {
    console.info("[DashTo30] Sound skipped:", key, error);
  }
}

export function startMusic(key: MusicKey) {
  const state = getState();

  if (!state) return;

  state.desiredMusicKey = key;

  if (!isMusicEnabled()) {
    stopMusic();
    return;
  }

  if (!state.unlocked || state.musicSuspended) {
    return;
  }

  if (
    state.activeMusic &&
    state.activeMusicKey === key &&
    !state.activeMusic.paused
  ) {
    return;
  }

  stopMusic();

  const src = MUSIC_ASSETS[key];

  if (!src) return;

  const audio = new Audio(src);

  audio.loop = true;
  audio.preload = "auto";
  audio.volume = MUSIC_VOLUME[key] ?? 0.16;

  state.activeMusic = audio;
  state.activeMusicKey = key;
  state.musicPool.add(audio);

  void audio.play().catch((error) => {
    console.info("[DashTo30] Music skipped:", key, error);
  });
}

export function stopMusic() {
  const state = getState();

  if (!state) return;

  state.musicPool.forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore broken audio instances.
    }
  });

  state.musicPool.clear();
  state.activeMusic = null;
  state.activeMusicKey = null;
}

export function suspendMusic() {
  const state = getState();

  if (!state) return;

  state.musicSuspended = true;
  stopMusic();
}

export function resumeMusic(key?: MusicKey) {
  const state = getState();

  if (!state) return;

  state.musicSuspended = false;
  state.unlocked = true;

  const nextKey = key ?? state.desiredMusicKey;

  if (nextKey && isMusicEnabled()) {
    startMusic(nextKey);
  }
}
