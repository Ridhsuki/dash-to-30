export type EntityKind = "want" | "need" | "payday" | "boss";

export type GameAiConfig = {
  wants: string[];
  needs: string[];
  roast: string;
};

const DEFAULT_CONFIG: GameAiConfig = {
  wants: ["Coffee", "Gacha", "Paylater"],
  needs: ["Rent", "Groceries"],
  roast: "Broke!",
};

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "of",
  "and",
  "or",
  "for",
  "to",
  "di",
  "ke",
  "dari",
  "yang",
  "dan",
  "atau",
  "untuk",
  "dengan",
  "bulan",
  "ini",
]);

const MAX_FULL_LABEL_LENGTH = 42;

function cleanText(value: unknown, fallback: string): string {
  const raw = typeof value === "string" ? value : fallback;

  const cleaned = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s+&/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || fallback;
}

function limitText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function normalizeLabel(value: unknown, fallback: string): string {
  return limitText(cleanText(value, fallback), MAX_FULL_LABEL_LENGTH);
}

function normalizeRoast(value: unknown): string {
  const raw = typeof value === "string" ? value : DEFAULT_CONFIG.roast;

  return raw.replace(/\s+/g, " ").trim().slice(0, 180) || DEFAULT_CONFIG.roast;
}

function fillList(
  items: string[],
  fallback: string[],
  targetLength: number,
): string[] {
  const result = [...items];

  for (let i = 0; result.length < targetLength; i += 1) {
    result.push(fallback[i % fallback.length]);
  }

  return result.slice(0, targetLength);
}

export function normalizeAiConfig(input: unknown): GameAiConfig {
  const value =
    input && typeof input === "object" ? (input as Partial<GameAiConfig>) : {};

  const wants = Array.isArray(value.wants)
    ? value.wants.map((item) => normalizeLabel(item, "Debt")).filter(Boolean)
    : [];

  const needs = Array.isArray(value.needs)
    ? value.needs.map((item) => normalizeLabel(item, "Bill")).filter(Boolean)
    : [];

  return {
    wants: fillList(wants, DEFAULT_CONFIG.wants, 3),
    needs: fillList(needs, DEFAULT_CONFIG.needs, 2),
    roast: normalizeRoast(value.roast),
  };
}

export function pickRandomLabel(items: string[], fallback: string): string {
  if (!items.length) return fallback;

  const index = Math.floor(Math.random() * items.length);
  return items[index] || fallback;
}

export function compactEntityLabel(
  value: unknown,
  kind: EntityKind,
): {
  fullLabel: string;
  shortLabel: string;
} {
  if (kind === "payday") {
    return {
      fullLabel: "PAYDAY",
      shortLabel: "PAYDAY",
    };
  }

  if (kind === "boss") {
    const fullLabel = normalizeLabel(value, "Tax Audit");

    return {
      fullLabel,
      shortLabel: limitText(fullLabel.toUpperCase(), 12),
    };
  }

  const fullLabel = normalizeLabel(value, kind === "need" ? "Bill" : "Debt");
  const words = fullLabel.split(" ").filter(Boolean);

  const usefulWords = words.filter(
    (word) => !STOP_WORDS.has(word.toLowerCase()),
  );
  const selectedWords = usefulWords.length > 0 ? usefulWords : words;

  const maxLength = kind === "need" ? 13 : 12;
  const shortLabel = limitText(
    selectedWords.slice(0, 2).join(" ").toUpperCase(),
    maxLength,
  );

  return {
    fullLabel,
    shortLabel: shortLabel || fullLabel.slice(0, maxLength).toUpperCase(),
  };
}
