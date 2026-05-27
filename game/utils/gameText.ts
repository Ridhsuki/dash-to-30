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
  default: "Your wallet tried its best, but your spending had other plans.",
  tooManyWants:
    "You gave every want a VIP pass, then acted shocked when your wallet left.",
  missedNeeds:
    "You ignored basic needs like budgeting was a magic trick. It was not.",
  bossHit: "The big bill arrived, and your wallet folded like a cheap receipt.",
  lowBalance:
    "Your balance did not disappear. It escaped for emotional safety.",
  win: "You balanced needs and wants. Your wallet finally respects you.",
};

const DEFAULT_CONFIG: GameAiConfig = {
  wants: ["Coffee", "Gacha", "Paylater"],
  needs: ["Rent", "Groceries"],
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
      legacyRoast || DEFAULT_ROASTS.tooManyWants,
    ),
    missedNeeds: normalizeRoast(
      source.missedNeeds,
      legacyRoast || DEFAULT_ROASTS.missedNeeds,
    ),
    bossHit: normalizeRoast(
      source.bossHit,
      legacyRoast || DEFAULT_ROASTS.bossHit,
    ),
    lowBalance: normalizeRoast(
      source.lowBalance,
      legacyRoast || DEFAULT_ROASTS.lowBalance,
    ),
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
          normalizeText(item, DEFAULT_CONFIG.wants[index] || "Debt", 16),
        )
    : DEFAULT_CONFIG.wants;

  const needs = Array.isArray(source.needs)
    ? source.needs
        .slice(0, 2)
        .map((item, index) =>
          normalizeText(item, DEFAULT_CONFIG.needs[index] || "Bill", 16),
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
      ? "Want"
      : kind === "need"
        ? "Need"
        : kind === "boss"
          ? "Boss"
          : "Payday";

  const fullLabel = normalizeText(label, fallback, 42);
  const shortLabel =
    fullLabel.length > 14 ? `${fullLabel.slice(0, 13)}…` : fullLabel;

  return {
    fullLabel,
    shortLabel,
  };
}
