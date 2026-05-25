'use server';

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

/**
 * Generates dynamic game obstacles and a personalized financial roast based on the user's spending confession.
 * Runs strictly server-side using the secure GEMINI_API_KEY.
 */
export async function generateGameConfig(confession: string): Promise<GameConfigResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined. Using fallback config.');
    return FALLBACK_CONFIG;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: confession,
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
      return {
        wants: parsed.wants.slice(0, 3) as string[],
        needs: parsed.needs.slice(0, 2) as string[],
        roast: parsed.roast as string
      };
    }

    throw new Error('Invalid JSON structure returned by model');
  } catch (error) {
    console.error('Gemini generateGameConfig Action Error:', error);
    return FALLBACK_CONFIG;
  }
}
