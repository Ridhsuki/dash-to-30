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
        systemInstruction: "You are a sarcastic financial advisor and game designer. The user will give a financial confession. Return a JSON with 3 specific wants (enemies), 2 specific needs (good items), and 1 short, biting financial roast. JSON format: { \"wants\": [\"string\", \"string\", \"string\"], \"needs\": [\"string\", \"string\"], \"roast\": \"string\" }"
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
        wants: parsed.wants.slice(0, 3) as string[],
        needs: parsed.needs.slice(0, 2) as string[],
        roast: parsed.roast as string
      };
      return NextResponse.json(sanitized);
    }

    throw new Error('Invalid JSON structure returned by model');
  } catch (error) {
    console.error('Gemini API Route Error:', error);
    return NextResponse.json(FALLBACK_CONFIG);
  }
}
