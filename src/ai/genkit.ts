import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuração central do Genkit para o Compromisso.
 * PROTEÇÃO DE SEGURANÇA: Este arquivo nunca deve ser importado em componentes 'use client'.
 */

if (typeof window !== 'undefined') {
  console.error("⚠️ [SEGURANÇA] Tentativa de carregar configuração de IA no navegador detectada e bloqueada.");
}

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ [AVISO] Chave de API da Aurora (Gemini) não localizada nas variáveis de ambiente.");
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
});
