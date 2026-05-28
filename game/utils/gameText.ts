export type EntityKind = "want" | "need" | "payday" | "boss";

export type RoastProfile = {
  default: string;
  tooManyWants: string;
  missedNeeds: string;
  bossHit: string;
  lowBalance: string;
  win: string;
};

export type GameAiConfig = {
  wants: string[];
  needs: string[];
  roast: string;
  roasts: RoastProfile;
};

const DEFAULT_ROASTS: RoastProfile = {
  default:
    "Dompet kamu bukan bocor lagi, ini sudah kayak keran rusak di akhir bulan.",
  tooManyWants:
    "Keinginan kamu terlalu sering dipeluk. Kebutuhan cuma jadi figuran.",
  missedNeeds:
    "Kebutuhan pokok kamu tinggalin. Hemat boleh, tapi jangan pura-pura kebal lapar.",
  bossHit:
    "Tagihan besar datang, budget kamu langsung tiarap tanpa perlawanan.",
  lowBalance:
    "Saldo habis bukan karena semesta jahat. Kadang keputusanmu saja terlalu pede.",
  win: "Mantap, kamu berhasil menahan godaan dan tetap ngurus kebutuhan.",
};

const DEFAULT_CONFIG: GameAiConfig = {
  wants: ["Kopi", "Diskon", "Gacha"],
  needs: ["Makan", "Kos"],
  roast: DEFAULT_ROASTS.default,
  roasts: DEFAULT_ROASTS,
};

function normalizeText(value: unknown, fallback: string, maxLength = 42) {
  const raw = typeof value === "string" ? value : fallback;

  const cleaned = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s+&/.,!?'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (cleaned || fallback).slice(0, maxLength);
}

function normalizeRoast(value: unknown, fallback: string) {
  return normalizeText(value, fallback, 190);
}

function normalizeRoasts(value: unknown, legacyRoast: string): RoastProfile {
  const source =
    value && typeof value === "object" ? (value as Partial<RoastProfile>) : {};

  return {
    default: normalizeRoast(
      source.default,
      legacyRoast || DEFAULT_ROASTS.default,
    ),
    tooManyWants: normalizeRoast(
      source.tooManyWants,
      DEFAULT_ROASTS.tooManyWants,
    ),
    missedNeeds: normalizeRoast(source.missedNeeds, DEFAULT_ROASTS.missedNeeds),
    bossHit: normalizeRoast(source.bossHit, DEFAULT_ROASTS.bossHit),
    lowBalance: normalizeRoast(source.lowBalance, DEFAULT_ROASTS.lowBalance),
    win: normalizeRoast(source.win, DEFAULT_ROASTS.win),
  };
}

export function normalizeAiConfig(value: unknown): GameAiConfig {
  if (!value || typeof value !== "object") {
    return DEFAULT_CONFIG;
  }

  const source = value as Partial<GameAiConfig>;

  const wants = Array.isArray(source.wants)
    ? source.wants
        .slice(0, 3)
        .map((item, index) =>
          normalizeText(item, DEFAULT_CONFIG.wants[index] || "Godaan", 16),
        )
    : DEFAULT_CONFIG.wants;

  const needs = Array.isArray(source.needs)
    ? source.needs
        .slice(0, 2)
        .map((item, index) =>
          normalizeText(item, DEFAULT_CONFIG.needs[index] || "Kebutuhan", 16),
        )
    : DEFAULT_CONFIG.needs;

  const roast = normalizeRoast(source.roast, DEFAULT_CONFIG.roast);
  const roasts = normalizeRoasts(source.roasts, roast);

  return {
    wants,
    needs,
    roast,
    roasts,
  };
}

export function pickRandomLabel(labels: string[], fallback: string) {
  if (!Array.isArray(labels) || labels.length === 0) {
    return fallback;
  }

  return labels[Math.floor(Math.random() * labels.length)] || fallback;
}

export function compactEntityLabel(label: string, kind: EntityKind) {
  const fallback =
    kind === "want"
      ? "Godaan"
      : kind === "need"
        ? "Kebutuhan"
        : kind === "boss"
          ? "Tagihan"
          : "Gajian";

  const fullLabel = normalizeText(label, fallback, 42);
  const shortLabel =
    fullLabel.length > 14 ? `${fullLabel.slice(0, 13)}…` : fullLabel;

  return {
    fullLabel,
    shortLabel,
  };
}
