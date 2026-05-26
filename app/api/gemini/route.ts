import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface GameConfigResponse {
  wants: string[];
  needs: string[];
  roast: string;
}

const FALLBACK_CONFIG: GameConfigResponse = {
  wants: ['Impulse Buy', 'Latte', 'Sale Item'],
  needs: ['Rent', 'Groceries'],
  roast: 'You broke the AI with your terrible spending habits, but your wallet is still crying.'
};

function sanitizeGameLabel(value: unknown, fallback: string): string {
  const raw = typeof value === 'string' ? value : fallback;

  const cleaned = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s+&/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (cleaned || fallback).slice(0, 42);
}

function sanitizeRoast(value: unknown): string {
  const raw = typeof value === 'string' ? value : FALLBACK_CONFIG.roast;
  return raw.replace(/\s+/g, ' ').trim().slice(0, 180) || FALLBACK_CONFIG.roast;
}

export async function POST(req: Request) {
  try {
    const { confession } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not defined. Using fallback config.');
      return NextResponse.json(FALLBACK_CONFIG);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: confession || "Generate a generic confession",
      config: {
        responseMimeType: 'application/json',
        systemInstruction: "You are a sarcastic financial advisor and game designer for a 2D runner game. The user will give a financial confession. Return JSON only. Create 3 wants as enemy labels and 2 needs as good item labels. Each wants/needs label must be short, readable while running, max 2 words, max 16 characters if possible. Do not write sentences inside wants or needs. The roast may be funny but must be concise. JSON format: { \"wants\": [\"string\", \"string\", \"string\"], \"needs\": [\"string\", \"string\"], \"roast\": \"string\" }"
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response text from Gemini API');
    }

    const parsed = JSON.parse(text);

    // Validate the parsed structure
    if (
      parsed &&
      Array.isArray(parsed.wants) &&
      Array.isArray(parsed.needs) &&
      typeof parsed.roast === 'string'
    ) {
      const sanitized: GameConfigResponse = {
        wants: parsed.wants
          .slice(0, 3)
          .map((item: unknown, index: number) =>
            sanitizeGameLabel(item, FALLBACK_CONFIG.wants[index] || 'Debt'),
          ),
        needs: parsed.needs
          .slice(0, 2)
          .map((item: unknown, index: number) =>
            sanitizeGameLabel(item, FALLBACK_CONFIG.needs[index] || 'Bill'),
          ),
        roast: sanitizeRoast(parsed.roast),
      };
      return NextResponse.json(sanitized);
    }

    throw new Error('Invalid JSON structure returned by model');
  } catch (error) {
    console.error('Gemini API Route Error:', error);
    return NextResponse.json(FALLBACK_CONFIG);
  }
}
