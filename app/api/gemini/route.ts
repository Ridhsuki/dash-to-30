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
  default:
    "Dompet lo bukan bocor lagi, ini mah udah boncos kuadrat. Minimal sadar diri, ngab.",
  tooManyWants:
    "Keinginan lo fomo banget didekep mulu, giliran kebutuhan cuma dicuekin kayak chat gebetan.",
  missedNeeds:
    "Kebutuhan pokok lo skip demi gengsi? Hemat kagak, nyiksa diri iya. Minimal hidup jangan mode bertahan pakai satu persen baterai, lah.",
  bossHit:
    "Begitu tagihan gede *drop*, mental budget lo langsung kena mental dan *out of pocket* banget.",
  lowBalance:
    "Saldo lo sekarat bukan takdir, tapi akibat kebanyakan *impulsive buying* berkedok *self-reward*.",
  win: "Skena abis! Berhasil nahan *FOMO* belanja dan tetep *prioritize* kebutuhan. Lo keren, wir!",
};

const FALLBACK_CONFIG: GameConfigResponse = {
  wants: ["Kopi", "Diskon", "Gacha"],
  needs: ["Makan", "Kos"],
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
        "Buat profil finansial umum untuk game literasi keuangan 2D runner.",
      config: {
        responseMimeType: "application/json",

        systemInstruction: `
kamu adalah penulis dialog NPC untuk game 2D runner finansial bernama Dash to 30.

GAYA UTAMA:
- anak Gen Z Indonesia
- santai, receh, sarkas ringan, lucu
- kayak komentar TikTok + chat teman sendiri
- sangat relatable kehidupan sehari-hari

WAJIB BAHASA:
- Indonesia santai (NO formal banking style)
- boleh pakai: gas, auto, zonk, wkwk, fix, anjay (secukupnya), red flag, bocor, jebol, cuan tapi minus
- jangan seperti artikel keuangan atau bank

VIBE GAME:
- seperti NPC game mobile
- seperti roasting teman sendiri
- seperti komentar TikTok yang nyelekit tapi lucu

ATURAN OUTPUT:
- JSON saja (STRICT)
- wants & needs maksimal 2 kata
- roast maksimal 120 karakter
- tetap aman (NO SARA, NO self-harm, NO hate speech)
- tetap lucu, tidak ofensif serius

GANTI ISTILAH FORMAL:
- pengeluaran → cash out / bocor saldo
- pendapatan → cash drop / saldo masuk
- hutang → debt trap / beban
- kebutuhan → needs / wajib hidup
- keinginan → wants / godaan

FORMAT JSON:
{
  "wants": ["string", "string", "string"],
  "needs": ["string", "string"],
  "roast": "string",
  "roasts": {
    "default": "string",
    "tooManyWants": "string",
    "missedNeeds": "string",
    "bossHit": "string",
    "lowBalance": "string",
    "win": "string"
  }
}
        `,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response text from Gemini API");
    }

    const parsed = JSON.parse(text);

    if (parsed && Array.isArray(parsed.wants) && Array.isArray(parsed.needs)) {
      const legacyRoast = sanitizeRoast(parsed.roast, FALLBACK_ROASTS.default);
      const roasts = sanitizeRoasts(parsed.roasts, legacyRoast);

      return NextResponse.json({
        wants: parsed.wants
          .slice(0, 3)
          .map((v: unknown, i: number) =>
            sanitizeGameLabel(v, FALLBACK_CONFIG.wants[i] || "Godaan"),
          ),
        needs: parsed.needs
          .slice(0, 2)
          .map((v: unknown, i: number) =>
            sanitizeGameLabel(v, FALLBACK_CONFIG.needs[i] || "Kebutuhan"),
          ),
        roast: roasts.default,
        roasts,
      });
    }

    throw new Error("Invalid JSON structure returned by model");
  } catch (error) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json(FALLBACK_CONFIG);
  }
}