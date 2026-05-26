export const GAMEPLAY = {
  startingBalance: 0,

  initialPaydayAmount: 2000,

  maxDay: 30,
  bossStartDay: 20,
  finalBossDay: 28,

  // 2.6s x 30 hari = sekitar 78 detik.
  // Ini lebih enak untuk runner pendek, tidak terlalu cepat selesai.
  dayDurationMs: 2600,

  // Minimum durasi slide agar sprite tidak flicker saat hitbox berubah.
  slideMinDurationMs: 180,

  baseSpawnDelayMs: 1550,
  crisisSpawnDelayMs: 1250,
  bossSpawnDelayMs: 980,

  baseObstacleSpeed: -250,
  crisisObstacleSpeed: -310,
  bossObstacleSpeed: -380,

  wantDamage: -300,
  bossDamage: -650,
  needCost: -50,
  missedNeedPenalty: -180,

  // Skor leaderboard harus berbasis point, bukan balance mentah.
  pointsPerSurvivedDay: 120,
  pointsPerNeedTaken: 45,
  pointsPerWantAvoided: 35,
  pointsPerBossAvoided: 80,
  remainingBalanceDivisor: 25,

  eventFeedLimit: 5,
} as const;

export const LANES = {
  // Ground lane: obstacle/item yang disentuh normal.
  groundOffsetY: 24,

  // Duck lane: obstacle setengah badan.
  // Player normal kena, player slide bisa lolos.
  duckOffsetY: 54,

  // Boss/projectile lane.
  bossOffsetY: 58,
} as const;
