
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuração central do Genkit para o Compromisso.
 * Utiliza a chave funcional validada pelo usuário.
 */

const GEMINI_KEY = "AIzaSyAh2ClldUdbLvDXH9O3USELgPb3GCOrHBA";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GEMINI_KEY,
    }),
  ],
});
