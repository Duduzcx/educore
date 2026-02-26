
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuração central do Genkit 1.x para o Compromisso.
 * Prioriza a chave de teste fornecida para garantir comunicação imediata.
 */

const TEST_KEY = "AIzaSyD1gSZdRe0bW5Y7aWTMBQk0nM8RoMnaE4A";

// Função para obter a chave de forma segura, evitando strings de placeholder
const getApiKey = () => {
  const envKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'sua-chave-aqui' && envKey.startsWith('AIza')) {
    return envKey;
  }
  return TEST_KEY;
};

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: getApiKey(),
    }),
  ],
});
