export type GameSoundKey =
  | "uiClick"
  | "settingsToggle"
  | "currency"
  | "moneyIn"
  | "hitWant"
  | "need"
  | "jump"
  | "slide"
  | "pause"
  | "win"
  | "lose";

export type MusicKey = "home" | "game";

export type AudioAssetSource = string | string[];

const AUDIO_BASE_URL = process.env.NEXT_PUBLIC_AUDIO_BASE_URL?.replace(
  /\/$/,
  "",
);

function audio(fileName: string) {
  return AUDIO_BASE_URL
    ? `${AUDIO_BASE_URL}/${fileName}`
    : `/audio/${fileName}`;
}

const DEFAULT_UI_SFX = audio("dt30-ui.wav");

export const AUDIO_ASSETS: Record<GameSoundKey, AudioAssetSource> = {
  uiClick: DEFAULT_UI_SFX,
  settingsToggle: DEFAULT_UI_SFX,
  currency: audio("rakyat-di-desa-gak-pake-dollar-kok_kQf8npW.mp3"),
  moneyIn: audio("dt30-moneyin.wav"),
  hitWant: audio("dt30-hitwant.wav"),
  need: audio("dt30-need.wav"),
  jump: audio("dt30-jump.wav"),
  slide: audio("dt30-slide.wav"),
  pause: audio("shocked-sound-effect.mp3"),

  win: [
    // audio("dt30-win.wav"),
    audio("win1.mp3"),
    audio("win2.mp3"),
    audio("win3.mp3"),
    audio("win4.mp3"),
    // audio("win5.mp3"),
  ],

  lose: [
    // audio("dt30-lose.wav"),
    audio("lose1.mp3"),
    audio("lose2.mp3"),
    audio("lose3.mp3"),
  ],
};

export const MUSIC_ASSETS: Record<MusicKey, string> = {
  home: audio("dt30-home-loop.wav"),
  game: audio("dt30-game-loop.wav"),
};

export const AUDIO_VOLUME: Record<GameSoundKey, number> = {
  uiClick: 0.6,
  settingsToggle: 0.6,
  currency: 0.82,
  moneyIn: 0.68,
  hitWant: 0.72,
  need: 0.62,
  jump: 0.58,
  slide: 0.55,
  pause: 0.6,
  win: 0.82,
  lose: 0.82,
};

export const MUSIC_VOLUME: Record<MusicKey, number> = {
  home: 0.28,
  game: 0.26,
};
