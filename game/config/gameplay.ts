export const GAMEPLAY = {
  startingBalance: 0,
  initialPaydayAmount: 2000,

  maxDay: 30,
  bossStartDay: 20,
  finalBossDay: 28,

  dayDurationMs: 2600,
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

  maxEssentialLife: 3,
  missedNeedLifePenalty: 1,
  needLifeReward: 0,

  pointsPerSurvivedDay: 120,
  pointsPerNeedTaken: 45,
  pointsPerMissedNeedPenalty: -70,
  pointsPerWantAvoided: 35,
  pointsPerBossAvoided: 80,
  remainingBalanceDivisor: 25,

  // Needs lebih sering muncul di atas agar jump benar-benar berguna.
  needJumpLaneChance: 0.68,

  // Wants tetap punya duck lane.
  wantDuckLaneChance: 0.42,

  // Boss dibuat variatif: sebagian bawah, sebagian atas.
  bossDuckLaneChance: 0.55,

  eventFeedLimit: 5,
} as const;

export const LANES = {
  groundOffsetY: 24,

  // Untuk obstacle yang harus ditunduki.
  duckOffsetY: 54,

  // Untuk needs yang harus diraih dengan jump.
  needJumpOffsetY: 88,

  // Boss duck lane. Normal kena, slide lolos.
  bossDuckOffsetY: 58,

  // Boss ground lane. Harus dihindari dengan jump.
  bossGroundOffsetY: 24,
} as const;
