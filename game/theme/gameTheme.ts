export type MonthPhase = 'young' | 'middle' | 'old' | 'boss';

export const GAME_RGB = {
  sky: 0xdff4ff,
  cream: 0xfff6e8,
  receipt: 0xfff1c7,
  text: 0x4a3a2a,
  brown: 0x8b5e3c,
  gold: 0xffc857,
  orange: 0xff9f1c,
  green: 0x6fd08c,
  pink: 0xff7aa2,
  red: 0xff6b6b,
  purple: 0x9b8cff,
  aqua: 0xbfedff,
  paleBlue: 0xcdefff,
} as const;

export const GAME_HEX = {
  sky: '#DFF4FF',
  cream: '#FFF6E8',
  receipt: '#FFF1C7',
  text: '#4A3A2A',
  brown: '#8B5E3C',
  gold: '#FFC857',
  orange: '#FF9F1C',
  green: '#6FD08C',
  pink: '#FF7AA2',
  red: '#FF6B6B',
  purple: '#9B8CFF',
  aqua: '#BFEDFF',
  paleBlue: '#CDEFFF',
} as const;

export const PHASE_THEME: Record<
  MonthPhase,
  {
    label: string;
    skyKey: string;
    labelColor: string;
  }
> = {
  young: {
    label: 'TANGGAL MUDA MODE',
    skyKey: 'dt30_sky_young',
    labelColor: GAME_HEX.green,
  },
  middle: {
    label: 'MID MONTH REALITY CHECK',
    skyKey: 'dt30_sky_middle',
    labelColor: GAME_HEX.gold,
  },
  old: {
    label: 'TANGGAL TUA SURVIVAL',
    skyKey: 'dt30_sky_old',
    labelColor: GAME_HEX.pink,
  },
  boss: {
    label: 'AKHIR BULAN BOSS STAGE',
    skyKey: 'dt30_sky_boss',
    labelColor: GAME_HEX.red,
  },
};

export function getMonthPhase(day: number, isBossStage: boolean): MonthPhase {
  if (isBossStage || day >= 28) return 'boss';
  if (day >= 21) return 'old';
  if (day >= 11) return 'middle';
  return 'young';
}
