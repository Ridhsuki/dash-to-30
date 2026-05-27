import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface RoastProfile {
  default: string;
  tooManyWants: string;
  missedNeeds: string;
  bossHit: string;
  lowBalance: string;
  win: string;
}

interface GameConfigResponse {
  wants: string[];
  needs: string[];
  roast: string;
  roasts: RoastProfile;
}

const FALLBACK_ROASTS: RoastProfile = {
  default: "Your wallet tried its best, but your spending had other plans.",
  tooManyWants:
    "You kept feeding every want like your wallet had unlimited lives.",
  missedNeeds:
    "You skipped basic needs like hunger accepts exposure as payment.",
  bossHit: "The big bill arrived, and your budget was not wearing armor.",
  lowBalance:
    "Your balance hit zero with the confidence of someone ignoring receipts.",
  win: "You balanced needs and wants. Your wallet finally stopped crying.",
};

const FALLBACK_CONFIG: GameConfigResponse = {
  wants: ["Impulse Buy", "Latte", "Sale Item"],
  needs: ["Rent", "Groceries"],
  roast: FALLBACK_ROASTS.default,
  roasts: FALLBACK_ROASTS,
};

function sanitizeGameLabel(value: unknown, fallback: string): string {
  const raw = typeof value === "string" ? value : fallback;

  const cleaned = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s+&/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (cleaned || fallback).slice(0, 16);
}

function sanitizeRoast(value: unknown, fallback: string): string {
  const raw = typeof value === "string" ? value : fallback;

  return (
    raw.replace(/\s+/g, " ").replace(/[<>]/g, "").trim().slice(0, 190) ||
    fallback
  );
}

function sanitizeRoasts(value: unknown, fallbackRoast: string): RoastProfile {
  const source =
    value && typeof value === "object" ? (value as Partial<RoastProfile>) : {};

  return {
    default: sanitizeRoast(source.default, fallbackRoast),
    tooManyWants: sanitizeRoast(
      source.tooManyWants,
      fallbackRoast || FALLBACK_ROASTS.tooManyWants,
    ),
    missedNeeds: sanitizeRoast(
      source.missedNeeds,
      fallbackRoast || FALLBACK_ROASTS.missedNeeds,
    ),
    bossHit: sanitizeRoast(
      source.bossHit,
      fallbackRoast || FALLBACK_ROASTS.bossHit,
    ),
    lowBalance: sanitizeRoast(
      source.lowBalance,
      fallbackRoast || FALLBACK_ROASTS.lowBalance,
    ),
    win: sanitizeRoast(source.win, FALLBACK_ROASTS.win),
  };
}

export async function POST(req: Request) {
  try {
    const { confession } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn(
        "GEMINI_API_KEY environment variable is not defined. Using fallback config.",
      );
      return NextResponse.json(FALLBACK_CONFIG);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "dash-to-30",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents:
        confession ||
        "Generate a generic funny financial confession profile for a 2D financial literacy runner game.",
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          'You are a sarcastic but playful Indonesian financial advisor and game writer for a 2D runner game called Dash to 30. The user gives a financial confession. Return JSON only. Create obstacles and roast lines that clearly relate to the confession. Use casual Indonesian mixed with simple English only when natural. Keep the tone funny, punchy, safe, and not hateful. Do not use slurs, threats, self-harm language, or extreme insults. Wants/needs labels must be short, max 2 words, readable while running. Roast lines must be concise, max 120 characters. Make each roast category meaningfully different: tooManyWants must roast impulsive spending, missedNeeds must roast ignoring basic needs, bossHit must roast big sudden bills, lowBalance must roast running out of money, win must congratulate the player. Return exactly this JSON shape: { "wants": ["string", "string", "string"], "needs": ["string", "string"], "roast": "string", "roasts": { "default": "string", "tooManyWants": "string", "missedNeeds": "string", "bossHit": "string", "lowBalance": "string", "win": "string" } }.',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response text from Gemini API");
    }

    const parsed = JSON.parse(text);

    if (parsed && Array.isArray(parsed.wants) && Array.isArray(parsed.needs)) {
      const legacyRoast = sanitizeRoast(parsed.roast, FALLBACK_CONFIG.roast);
      const roasts = sanitizeRoasts(parsed.roasts, legacyRoast);

      const sanitized: GameConfigResponse = {
        wants: parsed.wants
          .slice(0, 3)
          .map((item: unknown, index: number) =>
            sanitizeGameLabel(item, FALLBACK_CONFIG.wants[index] || "Debt"),
          ),
        needs: parsed.needs
          .slice(0, 2)
          .map((item: unknown, index: number) =>
            sanitizeGameLabel(item, FALLBACK_CONFIG.needs[index] || "Bill"),
          ),
        roast: roasts.default,
        roasts,
      };

      return NextResponse.json(sanitized);
    }

    throw new Error("Invalid JSON structure returned by model");
  } catch (error) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json(FALLBACK_CONFIG);
  }
}
