import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { env } from '@/lib/config/env';

const SYSTEM_PROMPT = 'You are a helpful assistant for students. Explain simply and clearly.';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });
  }
  return model;
}

export interface AIResponse {
  text: string;
  error?: string;
}

export async function generateAIResponse(message: string): Promise<AIResponse> {
  try {
    const generativeModel = getModel();

    const result = await generativeModel.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return { text };
  } catch (_error) {
    console.error('Gemini API error');
    return {
      text: '',
      error: _error instanceof Error ? _error.message : 'Failed to generate response',
    };
  }
}

export async function generateAIResponseWithHistory(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: string }>
): Promise<AIResponse> {
  try {
    const generativeModel = getModel();

    const chat = generativeModel.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.parts }],
      })),
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return { text };
  } catch (_error) {
    console.error('Gemini API error');
    return {
      text: '',
      error: _error instanceof Error ? _error.message : 'Failed to generate response',
    };
  }
}
